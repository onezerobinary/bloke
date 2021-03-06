
// general framework for ajax calls. 

function new_request_obj(){
    if (window.XMLHttpRequest)
        return new XMLHttpRequest();
    else
        return new ActiveXObject("Microsoft.XMLHTTP");
}

function request_callback(xmlhttp, _func, args){
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
		args.unshift(xmlhttp);
		_func.apply(this, args);
        }
    }
}

function make_request(xmlhttp, method, path, async, params){
    xmlhttp.open(method, path, async);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var s = "", i = 0;
    for (var k in params){
	if (i > 0)
  	  s += "&";
	s += k+"="+encodeURIComponent(params[k]);
	i++;
    }
    //xmlhttp.setRequestHeader("Content-length", s.length); // important?
    xmlhttp.send(s);
}


// inplace is either nothing or is the element corresponding to the bubble to change
function get_entry_data(name, inplace){
    inplace = typeof inplace !== 'undefined' ? inplace : 0;

    console.log(document.documentElement.scrollTop);
    console.log(document.body.scrollTop);

    xmlhttp = new_request_obj();
    request_callback(xmlhttp, _get_entry_data, [name, inplace, document.documentElement.scrollTop]);
    make_request(xmlhttp, "POST", "/bubbles/"+name, true, {"form":"load_content", "name":name});
    return false;
}

function get_page_data(page){
    xmlhttp = new_request_obj();
    request_callback(xmlhttp, _get_page_data, [page]);
    make_request(xmlhttp, "POST", "/pages/"+page, true, {"form":"load_content", "name":page});
    return false;
}

function get_post_data(page){
    console.log(page);
    xmlhttp = new_request_obj();
    request_callback(xmlhttp, _get_page_data, [page]);
    make_request(xmlhttp, "POST", "/posts/"+page, true, {"form":"load_content", "name":page});
    return false;
}

function load_all_bubbles(){
    console.log("loadem up!");
    xmlhttp = new_request_obj();
    request_callback(xmlhttp, _load_all_bubbles, []);
    make_request(xmlhttp, "POST", "/bubbles", true, {"form":"load_content", "request":"all"});
    return false;
}

function displaySearchResults(keystrokes){
    if (keystrokes.length == 0)
    { document.getElementById('search_results').innerHTML = ""; return;}

    xmlhttp = new_request_obj();

    // make callback even?
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
    	    document.getElementById('search_results').innerHTML = xmlhttp.responseText;
        }
    }
    make_request(xmlhttp, "POST", "index.php", true, {"form":"search_db", "keystrokes":keystrokes});
    return false;
}

// bubble functions

function new_bubble(name, content, pos){
    var proto = document.getElementById('bupbles').cloneNode(true);
    proto.getElementsByClassName('entry_content_box')[0].innerHTML = content;
	
//    MathJax.Hub.Typeset(proto);

    proto.getElementsByClassName('content_header')[0].innerHTML = "<h4>"+name+"</h4>";
    proto.setAttribute("class", "entry_div_box content_unit");
    proto.setAttribute("id", "entry_div_box_"+name);
    //proto.setAttribute("style", "position:absolute;margin-top:"+pos.toString()+"px;");
    var workflow_div;
    if (pos == 0){
       workflow_div = document.getElementById('main-text');
    } else {
       workflow_div = document.getElementById('workflow');
    }
    workflow_div.insertBefore(proto, workflow_div.children[1]);
}

function reload_bubble(name, content, element){
    element.getElementsByClassName('entry_content_box')[0].innerHTML = content;
    element.getElementsByClassName('content_header')[0].innerHTML = "<h4>"+name+"</h4>";
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}

function close_bubble(id){
 document.getElementById(id).remove();
}

// replace page
function replace_page(name, content, isGlos){
    document.getElementById("main-title").innerHTML = name;
    document.getElementById("main-text").innerHTML = content;
    if (isGlos){
        load_all_bubbles();
    }
}

// callback

function _get_entry_data(xmlhttp, name, inplace, pos){
    var response = JSON.parse(xmlhttp.responseText);
    content = response.bubbles[0].content;
    new_bubble(name, content, pos);
}

function _get_page_data(xmlhttp, pagename){
    var response = JSON.parse(xmlhttp.responseText);
    content = response.Text;
    isGlos = response.IsGlossary;
    replace_page(response.Title, content, isGlos);
}

function _load_all_bubbles(xmlhttp){ 
	var response = JSON.parse(xmlhttp.responseText);
    var bubbles = response.bubbles;
    for (var i=0 ; i < bubbles.length; i++){
        new_bubble(bubbles[i].title, bubbles[i].content, 0)
    }
}

