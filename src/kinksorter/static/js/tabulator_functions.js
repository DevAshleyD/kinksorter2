/*

var storage_table_storage_data = {};

var merge_movie = function(row){
    var movie_id = row.getData().movie_id;
    $.ajax({
        url: '/movie/merge',
        data: {movie_id: movie_id},
        success: function(data){
            $("#mainstorage_tabulator").tabulator("addRow", data, true);
            var movie_id = row.getData().movie_id;
            row.update({'status': 'in_main', 'movie_id': -1});
            row.update({'movie_id': movie_id});
        }
     });
};

var merge_multiple_movies = function(rows){
    var movie_ids = [];
    for (var key in rows)
        if (rows.hasOwnProperty(key))
            movie_ids.push(key);

    $.ajax({
        url: '/movie/merge_multiple',
        data: {movie_ids: movie_ids},
        success: function(data){
            data.forEach(function(movie_id) {
                var row = rows[movie_id];
                $("#mainstorage_tabulator").tabulator("addRow", row.getData(), true);
                row.update({'status': 'in_main', 'movie_id': -1});
                row.update({'movie_id': movie_id});
            });
        }
    });

};

var recognize_multiple = function(rows){
    var movie_ids = [];
    for (var key in rows)
        if (rows.hasOwnProperty(key))
            movie_ids.push(key);

    $.ajax({
        type: 'GET',
        url: '/movie/recognize_multiple',
        data: {movie_ids: movie_ids},
        success: function(data){
            data.forEach(function(movie) {
                var row = rows[movie.movie_id];
                row.update({'movie_id': -1});
                row.update(data);
                //FIXME: Check this works
            });
        }
    });
};

var merge_good_movies = function(storage_id){
    var rows = $("#newstorages_"+storage_id+"_tabulator").tabulator("getRows", true);

    var good_rows = {};
    rows.forEach(function(row){
        var row_data = row.getData();
        if (row_data.status == 'okay')
            good_rows[row.getData().movie_id] = row;
    });

    merge_multiple_movies(good_rows);
};



var reset_storage = function(storage_id) {
    $.ajax({
        url: "/storage/reset",
        data: {storage_id: storage_id},
        success: function(data) {
            // clear Storage and update MainStorage, which is cleaned by the backend
            var $storage = $(".newstorages_" + storage_id + "_tabulator").tabulator('clearData');
            update_table(0);
        }
    });
};

var recognize_storage = function(storage_id, force) {
    // Run /rec on all unrecognized movies. Force sets all movies to 0 and recognizes them
    var $tabulator = $("#newstorages_"+storage_id+"_tabulator");
    var rows = $tabulator.tabulator("getRows", true);

    if (force){
        $.ajax({
            url: "/storage/rerecognize",
            data: {storage_id: storage_id},
            success: function(data) {
                $tabulator.tabulator("clearData");
                $tabulator.tabulator("setData", data);

                update_tables(0);
            }
        });
    }
    else {
        var bad_rows = {};
        rows.forEach(function(row){
            var row_data = row.getData();
            if (row_data.status == 'unrecognized')
                bad_rows[row.getData().movie_id] = row;
        });

        recognize_multiple(bad_rows);
    }
};


*/

var show_tooltips = function(cell) {
        return cell.getData().full_path;
    };
var format_row = function(row){
    var color = {'unrecognized': '#ffc0c0', 'in_target': '#ffffc0', 'okay': '#c0ffc0'};
    row.getElement().css({"background-color": color[row.getData().status]});
};
var format_date = function(cell, params){
    var ts = parseInt(cell.getValue()) || null;
    if (ts == null)
        return;

    var date = new Date(ts*1000);
    return date.toISOString().slice(0,10);
};
var format_options = function(cell, params){
    var $container = $('<div>', {'class': 'options_container'});

    var $del = $('<img>');
    if (params.porn_directory_id != 0){
        $del.attr({alt: "Delete", src: '/static/img/delete.png', 'class': 'img_options delete'});
        $del.click(function(){
            delete_movie(cell.getRow())
        });
        var $add = $('<img>', {alt: "Add", src: '/static/img/move_to_target.png', 'class': 'img_options'});
        $add.click(function(){
            merge_movie(cell.getRow())
        });
        if (cell.getData().status == 'okay') {
            $container.append($add);
            $container.append('&nbsp;');
        }
    }
    else {
        $del.attr({alt: "Remove", src: '/static/img/remove_from_target.png', 'class': 'img_options'});
        $del.click(function(){remove_movie_from_target(cell.getRow())});
    }

    var $watch = $('<img>', {alt: "Watch", src: '/static/img/watch.png', 'class': 'img_options'});
    $watch.click(function(){
        window.open('/play_video/'+cell.getData().movie_id, '_blank');
    });

    $container.append($del);
    $container.append('&nbsp;');
    $container.append($watch);

    return $container;
};

var build_add_porn_directory = function(){
    var $add_directory = $('<div>', {'class': 'porn_directory_table_0 porn_directory'});
    var $add_directory_table = $('<table>');
    var $add_directory_table_tr = $('<tr>');
    var $add_directory_table_td_submit = $('<td>');
    var $add_directory_table_td_submit_input = $('<img>', {'class': 'img_functions',
        'src': '/static/img/add_porn_directory.png', 'alt': 'Add porn directory'}).click(add_porn_directory);
    var $add_directory_table_td_data = $('<td>');
    var $add_directory_table_td_data_input_name = $('<input>', {'class': 'input_name', 'name': 'porn_directory_name',
        'placeholder': 'New porn directory name'}).text('&nbsp;');
    var $add_directory_table_td_data_input_path = $('<input>', {'class': 'input_path', 'name': 'porn_directory_path',
        'placeholder': 'New porn directory path'});
    var $add_directory_table_td_data_input_ro = $('<input>', {'class': 'input_ro', 'name': 'porn_directory_read_only',
        'id': 'read_only', 'type': 'checkbox', 'value': 'False'});
    var $add_directory_table_td_data_input_ro_label = $('<input>', {'for': 'read_only'}).text('read_only?');

    // TODO:
    $add_directory_table_td_data_input_ro.append($add_directory_table_td_data_input_ro_label);
    $add_directory_table_td_data.append($add_directory_table_td_data_input_name);
    $add_directory_table_td_data.append($add_directory_table_td_data_input_path);
    $add_directory_table_td_data.append($add_directory_table_td_data_input_ro);
    $add_directory_table_td_submit.append($add_directory_table_td_submit_input);
    $add_directory_table_tr.append($add_directory_table_td_submit);
    $add_directory_table_tr.append($add_directory_table_td_data);
    $add_directory_table.append($add_directory_table_tr);
    $add_directory.append($add_directory_table);
    $("#porn_directory_tables_container").append($add_directory);
};
var build_porn_directory_container = function(porn_directory_id){
    var base_class = "porn_directory_" + porn_directory_id;
    // TODO: jqueryize
    $("#porn_directory_tables_container").append(
        "<hr />" +
        "<div class='"+base_class+" porn_directory'>" +
            "<table class='column_header_container'>" +
                "<tr>" +
                    "<td class='img_add_porn_directory'>" +
                        "<img title='Add all good movies' class='img_functions' " +
                            "src='/static/img/move_to_target.png' onClick='merge_good_movies(" + porn_directory_id + ")' />" +
                    "</td>" +
                    "<td class='column_header'>" +
                        "<span class='porn_directory_name'>_</span>" +
                        "<br /><span class='porn_directory_params'>&nbsp;</span>" +
                    "</td>" +
                    "<td class='img_delete_porn_directory'>" +
                        "<img title='Delete porn_directory' class='img_functions' src='/static/img/delete.png' "+
                            "onClick='delete_porn_directory(" + porn_directory_id + ")' />" +
                    "</td>" +
                "</tr>"+
            "</table>" +
            "<table class='column_function_container'>" +
                "<tr>" +
                    "<td class='rescan_storage'>" +
                        //TODO: Mouseover: verbose explanation
                        "<div class='click_function' onClick='rescan_porn_directory(" + porn_directory_id + ")'>" +
                            "<img title='Rescan storage' src='/static/img/rescan_porn_directory.png'  />" +
                            "<span class=img_description>Rescan storage</span>"+
                        "</div>" +
                    "</td>" +
                    "<td class='rescan_porn_directory'>" +
                        "<div class='click_function' onClick='reset_porn_directory(" + porn_directory_id + ")'>" +
                            "<img title='Force Rescan storage' src='/static/img/force_rescan_porn_directory.png' />" +
                            "<span class=img_description>Reset storage</span>"+
                        "</div>" +
                    "</td>" +
                    "<td class='recognize_movies'>" +
                        "<div class='click_function' onClick='recognize_porn_directory(" + porn_directory_id + ")'>" +
                            "<img title='Recognize unrecognized movies' src='/static/img/recognize_porn_directory.png' />" +
                            "<span class=img_description>Recognize unrecognized</span>" +
                        "</div>" +
                    "</td>" +
                    "<td class='recognize_movies'>" +
                        "<div class='click_function' onClick='recognize_porn_directory(" + porn_directory_id + ", true)'>" +
                            "<img title='Force recognize all movies' src='/static/img/force_recognize_porn_directory.png' />" +
                            "<span class=img_description>Re-recognize porn_directory</span>" +
                        "</div>" +
                    "</td>" +
                "</tr></table>" +
            "<div id='"+base_class+"_tabulator'></div>" +
        "</div>");
};
var build_porn_directory_tabulator = function(porn_directory_id){
    $("#porn_directory_" + porn_directory_id + "_tabulator").tabulator({
        //height:"100%",

        movableColumns: true,
        fitColumns: true,

        cellEdited: modify_movie,
        rowFormatter: format_row,

        tooltips: show_tooltips,

        columns: [
                {title: "", field: 'movie_id', formatter: format_options, minWidth: 65, width: 65,
                    formatterParams: {porn_directory_id: porn_directory_id}, headerSort: false, frozen: true},
                {title: 'Title', field: "title", formatter: "plaintext", editor: true, frozen: true,
                    minWidth: 300, variableHeight: true},
                {title: "ID", field: "scene_id", editor: true, minWidth: 60, width: 60},
                {title: "Date", field: "scene_date", formatter: format_date, minWidth: 95, width: 95},
                {title: "Site", field: "scene_site", width: 150},
                {title: "API", field: "api", minWidth: 80, width: 80}
        ]
    });
};
var set_porn_directory_header = function(porn_directory_info, porn_directory_id){
    var $porn_directory_name = $('<span>', {'class': 'porn_directory_name'})
        .text(porn_directory_info.porn_directory_name).prop('contentEditable', true);
    var read_only = ((porn_directory_info.porn_directory_read_only) ? " [read_only]" : "");
    var $porn_directory_params = $('<span>', {'class': 'porn_directory_params'})
        .text("(" + porn_directory_info.porn_directory_movies_count + " titles)" + read_only);

    $(".porn_directory_" + porn_directory_id + " .column_header").html("Storage ")
        .append($porn_directory_name).append("<br />").append($porn_directory_params);
    $(".porn_directory_" + porn_directory_id + " .column_header .porn_directory_name").blur(function(){
            change_porn_directory_name(porn_directory_id, $(this).text())});
};


var build_target_porn_directory_tabulator = function() {
    $("#target_porn_directory_tabulator").tabulator({
        movableColumns: true,
        fitColumns: true,

        cellEdited: modify_movie,

        tooltips: show_tooltips,

        columns: [
            {title: "", field: 'movie_id', formatter: format_options, minWidth: 48, width: 48,
                formatterParams: {porn_directory_id: 0}, headerSort: false, frozen: true},
            {title: 'Title', field: "title", formatter: "plaintext", editor: true, frozen: true,
                minWidth: 300, variableHeight: true},
            {title: "ID", field: "scene_id", editor: true, minWidth: 60, width: 60},
            {title: "Date", field: "scene_date", formatter: format_date, minWidth: 95, width: 95},
            {title: "Site", field: "scene_site", width: 150},
            {title: "API", field: "api", minWidth: 80, width: 80},
            {title: "Directory", field: "porn_directory_name", minWidth: 100, width: 100},

            {title: 'Status', field: "status", visible: false},
            {title: 'Movie ID', field: "movie_id", visible: false}
        ]
    });
};
var set_target_porn_directory_header = function(options) {};

var build_tables = function() {
    build_target_porn_directory_tabulator();
    build_porn_directory_tables();
    tables_built = true;
};

var build_porn_directory_tables = function() {
    build_add_porn_directory();

    for (var index in porn_directory_table_ids) {
        var porn_directory_id = porn_directory_table_ids[index];
        build_porn_directory_container(porn_directory_id);
        build_porn_directory_tabulator(porn_directory_id);
    }
};
