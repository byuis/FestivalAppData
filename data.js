var apiKey="AIzaSyBNphdpkYTS-VxNIeCQKBng-ep8efJcgpA";
var blogID="364951287152024711";
var dataStorePostID;  
var runCount=0;
var appData={};
var id = 1;
function getTagNo(tags, tagName, innerHTML){
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].innerHTML.length < innerHTML.length+5){
      if(tags[i].innerHTML.search(innerHTML)>-1){
        return i;
      }
    }
  }
  return -1;
}


function addSession(page){
    var groupName;
    var tags = page.getElementsByTagName("DIV");
    var tagNo;
    var theKind = "";
    var jsonData={};
    var openTag;
    var key;
    var val;
    var keyVal;

    var img;
    var x;
    var theDate = "";
    var datePoint;
    var groupPoint;
    //console.log("Full page", page);
    // look over all the tags to find the values we need
    for (var i = 0; i < tags.length; i++) {
      openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
      if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
        keyVal=getKeyVal(tags, i);
        key=keyVal[0];
        val=keyVal[1];

        switch(key) {
            case 'day':
                if(val.length>0){theDate=val};
               // console.log("in day switch", theDate);
                break;
            case 'groupLabel':
                if(val.length>0){theKind=val};
                break;
            case 'start':
                //console.log("adding start", val);
                if(val.length>0){
                    jsonData.timeStart = val;  //add the current key-value to the current json segment 
                    theKind=val.split(":")[0]+":00 "+  val.split(" ")[1];
                }
            break;
            case 'end':
                if(val.length>0){
                    jsonData.timeEnd = val;  
                    addOneSession(theDate, theKind, jsonData); // we hit end, time to schdeule
                }
                //console.log(jsonData.name, theDate,  JSON.parse(JSON.stringify(jsonData)));
                break;
            default:         
                if(val.length>0){
                  jsonData[key] = val;  //add the current key-value to the current json segment 
                }
        } 

      }
    }
    //console.log("jsonData.timeEnd",jsonData.timeEnd);
    if(jsonData.timeEnd===undefined){
      addOneSession(theDate, theKind, jsonData);
    }
   // //console.logg("");
}
function addOneSession(theDate, theKind, jsonData){
    jsonData["id"] = id++;
    var keyVal;

    // now we have built the stub, just need to put it in the right place
   if (appData.schedule===undefined){//adding the schedule array
       appData.schedule=[];
    }
    //adding the date array
    //console.log('checking to add date array',appData.schedule.filter(group => (group.date === theDate)));
    if (appData.schedule.filter(group => (group.date === theDate)).length === 0){
        appData.schedule.push({date:theDate,groups:[]});
        //console.log("date array len after push",appData.schedule.filter(group => (group.date === theDate)).length);
    }
    
    ////console.log("jsonfrag",jsonData);
    ////console.log("app data in schdeyule", appData);
    //console.log("theDate",theDate);
    ////console.log("theKind",theKind);
    ////console.log("new data",appData.schedule.filter(group => (group.date === theDate)));
    
    //adding the group array
    datePoint = appData.schedule.filter(group => (group.date === theDate))[0]
    //console.log("date point", datePoint);
    if (datePoint.groups.filter(group => (group.groupLabel === theKind)).length === 0){
        datePoint.groups.push({groupLabel:theKind,sessions:[]});
    }
    groupPoint=datePoint.groups.filter(group2 => (group2.groupLabel === theKind))[0];
    //console.log("group point", groupPoint);
    //console.log("ready to put frag",     jsonData);
    groupPoint.sessions.push(JSON.parse(JSON.stringify(jsonData)));
    jsonData={};
    //console.log("appData",appData);
 

}

function addSpeaker(page){
    var groupName;
    var tags = page.getElementsByTagName("DIV");
    var tagNo;
    var theKind;
    var jsonData={};
    var openTag;
    var key;
    var val;
    var keyVal;

    var img;
    var x;
  
  
    // look over all the tags to find the values we need
    for (var i = 0; i < tags.length; i++) {
      openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
      ////console.log("the Style",openTag);
      if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
        keyVal=getKeyVal(tags, i);
        key=keyVal[0];
        val=keyVal[1];
    
        if(key==="kind"){
          theKind=val;
          if(!appData.hasOwnProperty('speakerGroups')){
            appData.speakerGroups=[];
          }    
          if(appData.speakerGroups.filter(group => (group.kind === val)).length === 0){ // add group if it does not already exist
            appData.speakerGroups.push({"kind":val,"speakers":[]});
          } 
        }
        if(val==="<br>"){val=""};
        if(val.length>0){
          jsonData[key] = val;  //add the current key-value to the current speaker info 
        }
      }
    }
    jsonData["id"] = id++;
    //add the speaker into the set
    ////console.log("the___Kind", theKind); 
    appData.speakerGroups.filter(group => (group.kind === theKind))[0].speakers.push(jsonData);//[0]
    ////console.log("string app data",JSON.stringify(appData));
    // old way to build the group. 
    //tagNo =getTagNo(tags,"div","Kind")
    //theKind = tags[tagNo+1].innerHTML.replace(/[^\x20-\x7E]+/g, '').replace(/^\s+|\s+$/g,'');
    //if(speakers.filter(group => (group.kind === theKind)).length === 0){
    //  speakers.push({"kind":theKind,"speakers":[]});
    //}
  }
  


  function addLinks(page){
    var groupName;
    var tags = page.getElementsByTagName("DIV");
    var tagNo;
    var theKind;
    var linkData={};
    var openTag;
    var key;
    var val;
    var keyVal;
    var thePage;

    var img;
    var x;
  
    // look over all the tags to find the values we need
    for (var i = 0; i < tags.length; i++) {
      openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
      //console.log("the Style",openTag);
      if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
        keyVal=getKeyVal(tags, i);
        key=keyVal[0];
        val=keyVal[1];
        if(key==="page"){
          thePage=val;
          if(!appData.hasOwnProperty('linkPages')){
            appData.linkPages=[];
          }  
          if(appData.linkPages.filter(p => (p.page === thePage)).length === 0){
              appData.linkPages.push({"page":val,"linkGroups":[]}); 
            } 
        }else if(key=='ionIcon'){
            appData.linkPages[appData.linkPages.length-1][key]=val;
        }else if(key=='group'){
            theGroup=val;
            if(!appData.linkPages[appData.linkPages.length-1].hasOwnProperty('linkGroups')){
                appData.linkPages[appData.linkPages.length-1].linkGroups=[];
            }  
            if(appData.linkPages[appData.linkPages.length-1].linkGroups.filter(g => (g.group === theGroup)).length === 0){
                appData.linkPages[appData.linkPages.length-1].linkGroups.push({"group":val,"links":[]}); 
              } 
        }else{
            if(val==="<br>"){val=""};
            if(val.length>0){
                linkData[key]=val;
//                console.log("lp.length",appData.linkPages[appData.linkPages.length-1].linkGroups[appData.linkPages[appData.linkPages.length-1].linkGroups.length-1]);
//                appData.linkPages[appData.linkPages.length-1].linkGroups[appData.linkPages[appData.linkPages.length-1].linkGroups.length-1].links[0][key]=val;
            //linkData[key] = val;  //add the current key-value to the current speaker info 
            }
        }
      }
    }
    linkData["id"] = id++;   
    console.log("linkdata",linkData);
    console.log("appdata",appData);
    console.log("page",thePage);
    appData.linkPages[appData.linkPages.length-1].linkGroups[appData.linkPages[appData.linkPages.length-1].linkGroups.length-1].links.push(linkData);
  //  appData.linkPages.filter(p => (p.page === thePage))[0].groups.push(linkData);//[0]
  
  }

  function addInterests(page){
  var tags = page.getElementsByTagName("DIV");
  var tagNo;
  var jsonData={};
  var openTag;
  var key;
  var val;
  var keyVal;

  var img;
  var x;
  var theName;


  // look over all the tags to find the values we need
  for (var i = 0; i < tags.length; i++) {
    openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
    ////console.log("the Style",openTag);
    if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
      keyVal=getKeyVal(tags, i);
      key=keyVal[0];
      val=keyVal[1];
      
      if(key==='name'){
         theName=val;

      }
      if(val==="<br>"){val=""};
      if(val.length>0){
        jsonData[key] = val;  //add the current key-value to the current speaker info 
      }
    }
  }
  //jsonData.id = id++;  
  //console.log("interest", jsonData);
  if (appData.interests===undefined){
    appData.interests={};
  }
  appData.interests[theName]=jsonData;


}

function addIntro(page){
  var tags = page.getElementsByTagName("DIV");
  var tagNo;
  var jsonData={};
  var openTag;
  var key;
  var val;
  var keyVal;

  var img;
  var x;
  var theName;


  // look over all the tags to find the values we need
  for (var i = 0; i < tags.length; i++) {
    openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
    ////console.log("the Style",openTag);
    if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
      keyVal=getKeyVal(tags, i);
      key=keyVal[0];
      val=keyVal[1];
      
      if(key==='name'){
         theName=val;
      }
      if(val==="<br>"){val=""};
      if(val.length>0){
        if(val.toLowerCase()==="true"){
           jsonData[key] = true;
        }else {if(val.toLowerCase()==="false"){
          jsonData[key] = false;
        }else{  
          jsonData[key] = val;  //add the current key-value to the current speaker info 
        }}
      }
    }
  }
  //jsonData.id = id++;  
  //console.log("intro", jsonData);
  if (appData.intro===undefined){
    appData.intro=[];
  }
  appData.intro.push(jsonData);


}
  
// dead wood  if we build a festivals page for overall app, this code might be helpful
function addFestivals(page){
  var tags = page.getElementsByTagName("DIV");
  var tagNo;
  var jsonData={};
  var openTag;
  var key;
  var val;
  var keyVal;

  var img;
  var x;
  var theName;


  // look over all the tags to find the values we need
  for (var i = 0; i < tags.length; i++) {
    openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
    ////console.log("the Style",openTag);
    if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
      keyVal=getKeyVal(tags, i);
      key=keyVal[0];
      val=keyVal[1];
      
      if(key==='name'){
         theName=val;
      }
      if(val==="<br>"){val=""};
      if(val.length>0){
        jsonData[key] = val;  //add the current key-value to the current speaker info 
      }
    }
  }
  //jsonData.id = id++;  
  //console.log("festivals", jsonData);
  if (appData.festivals===undefined){
    appData.festivals=[];
  }
  appData.festivals.push(jsonData);
} 


function addMap(page){
  var tags = page.getElementsByTagName("DIV");
  var tagNo;
  var jsonData={};
  var openTag;
  var key;
  var val;
  var keyVal;

  var img;
  var x;
  var theName;


  // look over all the tags to find the values we need
  for (var i = 0; i < tags.length; i++) {
    openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
    ////console.log("the Style",openTag);
    if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
      keyVal=getKeyVal(tags, i);
      key=keyVal[0];
      val=keyVal[1];
      
      if(key==='name'){
         theName=val;
      }
      if(val==="<br>"){val=""};
      if(val.length>0){
        console.log(key, val, parseFloat(val));
        if(isNaN(val)){
          jsonData[key] = val;  //add the current key-value to the current speaker info 
        }else{
          jsonData=JSON.parse('{"' + key + '":' + val +', ' + JSON.stringify(jsonData).substr(1));
          console.log("Json", jsonData);
        }
      }
    }
  }
  //jsonData.id = id++;  
  //console.log("map", jsonData);
  if (appData.map===undefined){
    appData.map=[];
  }
  appData.map.push(jsonData);


}  
function isNumeric(val) {
    return Number(parseFloat(val)) != NaN;
}


function addEvent(page){
  var tags = page.getElementsByTagName("DIV");
  var tagNo;
  var jsonData={};
  var openTag;
  var key;
  var val;
  var keyVal;
  var img;
  var x;
  var theName;


  // look over all the tags to find the values we need
  for (var i = 0; i < tags.length; i++) {
    openTag = tags[i].outerHTML.substr(1,tags[i].outerHTML.indexOf(">")-1);
    ////console.log("the Style",openTag);
    if(openTag.indexOf("darkblue")>-1){ // we have a label, read it and its value
      keyVal=getKeyVal(tags, i);
      key=keyVal[0];
      val=keyVal[1];

      if(key==='name'){
         theName=val;
      }
      if(val.length>0){
        jsonData[key] = val;  //add the current key-value to the current speaker info 
      }
    }
  }
    appData.event=jsonData;
}  

function getKeyVal(tags,i){
  var key;
  var val;
  var keyVal=[];
      key=tags[i].innerText.replace(/[^\x20-\x7E]+/g, '').replace(/^\s+|\s+$/g,'');
      //check to see if the content has an image tag, if so, get the url
      img=tags[i+1].getElementsByTagName("IMG");
      if(img.length>0){
        val=img[0].src;
      }else{
        val=tags[i+1].innerText.replace(/[^\x20-\x7E]+/g, '').replace(/^\s+|\s+$/g,'');
      }
      if(key.substr(0,1)==="["){  // remove brackets
        key=key.substr(1,key.length-2);
        if(val.length>0){
          val=val.split(",").map(x => x.trim());  //adjust the val to be a proper array
        }
      }
      key=key.replace("'","");
      key=key.replace(" ","");
      key=key.substr(0,1).toLowerCase() + key.substr(1); 
      if (val==="<br>"){val="";}
      keyVal.push(key);
      keyVal.push(val);       
      return keyVal;
}  
function generate(){
console.log("at Generate", runCount);


console.log("at Generate if block");
var kind;
var text;
var pos=0;
var div;
var linkCount = 0;

var url="https://www.googleapis.com/blogger/v3/blogs/" + blogID + "/posts?maxResults=500&key=" + apiKey;
fetch(url)  
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        //console.log('Looks like there was a problem. Status Code: ' + response.status);  
        return;  
      }
      // check to see if we have already built the json.  if so. get me out of here
      runCount++;
      if (runCount>1){return;}
      // Examine the text in the response  
        response.json().then(function(data) {  
            //console.log('Response Data',data); 
            data.items.forEach(function(post){
            ////console.log(post.content)
            if(post.title.search('emplate')==-1){
                kind=post.content.split("--",2)[1];
                add_li(kind, post);
                if(post.title==="Data Store"){dataStorePostID=post.id;}
                // //console.log("kind",kind);
                div = document.createElement('div'); 
                div.innerHTML = post.content;  
                // now the post is in a dom sructure
//console.log("dom structure", div.innerHTML);
                for (var i = 0; i < div.childNodes.length; i++) {
                    if (div.childNodes[i].tagName==='DIV'){  // the template always starts with a div
                        if(div.childNodes[i].getAttribute('style').indexOf("table-row-group")>-1 ||div.childNodes[i].getAttribute('style').indexOf("display: table")>-1){
                            ////console.log("notename",i,div.childNodes[i].x.getAttributeNode('style'));  
                            console.log("at switch kind",kind);
                            switch(kind) {
                                case 'speakers':
                                    addSpeaker(div.childNodes[i]);
                                    break;
                                case 'links':
console.log("adding link", linkCount++);
                                    addLinks(div.childNodes[i]);
                                    break;
                                case 'interests':
                                    addInterests(div.childNodes[i]);
                                    break;
                                case 'intro':
                                    addIntro(div.childNodes[i]);
                                    break;
                                case 'map':
                                    addMap(div.childNodes[i]);
                                    break;
                                case 'session':
                                    addSession(div.childNodes[i]);
                                    break;
                                case 'exhibits':
                                    addSession(div.childNodes[i]);
                                    break;
                                case 'event': // don't need to include festival because they are handled through upadate.ts
                                    addEvent(div.childNodes[i]);
                                    break;
                                default:         
                            } 
                        }        
                    } 
                }
            }
        });
        //finished processing
        sortThings();
        ////console.log("appData", appData);
        printJson(); 
      }); 
    }  
  )  
  .catch(function(err) {  
    //console.log('Fetch Error :-S', err);  
  });
}

function sortThings(){
    //sort days
    appData.schedule=appData.schedule.sort(function (a, b) { 
            return b.date < a.date ?  1 // if b should come earlier, push a to end
                 : b.date > a.date ? -1 // if b should come later, push a to begin
                 : 0;                   // a and b are equal
            });
    
    //sort groups by name
    appData.schedule.forEach((day)=>{
        day.groups = day.groups.sort(function (a, b) { 
            return  Date.parse('01/01/2013 ' + b.groupLabel) < Date.parse('01/01/2013 ' + a.groupLabel) ? 1 // if b should come earlier, push a to end
                 :  Date.parse('01/01/2013 ' + b.groupLabel) > Date.parse('01/01/2013 ' + a.groupLabel) ? -1 // if b should come later, push a to begin
                 : 0;                   // a and b are equal
            });
        //sort schedule by time within groups
        day.groups.forEach((group)=>{
            group.sessions = group.sessions.sort(function (a, b) { 
                return Date.parse('01/01/2013 ' + b.timeStart) < Date.parse('01/01/2013 ' + a.timeStart) ?  1 // if b should come earlier, push a to end
                     : Date.parse('01/01/2013 ' + b.timeStart) > Date.parse('01/01/2013 ' + a.timeStart) ? -1 // if b should come later, push a to begin
                     : 0;                   // a and b are equal
            });
    });        
    });    

  


}

function printJson(){
    document.getElementById("data").innerHTML= JSON.stringify(appData,null,2) ;
    
}
function printTest2(){
    var dataString;
    var dataJson;
    var jsonFrag;
    dataJson={};
    dataJson.speakerGroups=[];
    dataJson.speakerGroups.push({});
    dataJson.speakerGroups[0].name="Gove"
    dataJson.speakerGroups[0].oneLiner="developer of this app"
    dataJson.speakerGroups[0].email="gove@byu.edu"
    jsonFrag={name:"Jack","oneLiner":"banker by day","email":"jack@byu.edu"};
    dataJson.speakerGroups.push(jsonFrag);
    
    
    dataString=JSON.stringify(dataJson);
    
    document.getElementById("data").innerHTML = "<pre>" + dataString + "</pre>";
  }
  function printTest(){
  var dataString;
  var dataJson;
  dataJson={};
  dataJson.attr1="a1";
  dataJson.attr2="a2";
  dataJson.attr3="a3";
  dataJson.attr4=[];
  dataJson.attr4.push(1);
  dataJson.attr4.push(2);
  dataJson.attr4.push(3);

  dataString=JSON.stringify(dataJson);
  
  document.getElementById("data").innerHTML=dataString;
  
}
function add_li(parentid, post) {
  if(parentid==="intro"||parentid==="map"||parentid==="links"||parentid==="interests"){
    var ul = document.getElementById('event');
  }else{
     var ul = document.getElementById(parentid);
  }
  if (ul===null){return;}
  var li = document.createElement("li");
  var link = document.createElement("a");
  link.setAttribute("href","https://www.blogger.com/blogger.g?blogID="+post.blog.id+"#editor/target=post;postID=" + post.id)
  link.setAttribute("target","blogerFrame");
  link.appendChild(document.createTextNode(post.title));
  li.appendChild(link);
  var d =  new Date(post.published);
  li.appendChild(document.createTextNode(" " + d.toLocaleDateString('en-US')));
  //id++;  
//  li.setAttribute("id", id); // added line
  ul.appendChild(li);
  //alert(li.id);
}
function openDataStore(){
  document.getElementById("data").select();
  document.execCommand("copy");
  window.open("https://www.blogger.com/blogger.g?blogID=" + blogID + "#editor/target=post;postID=" + dataStorePostID,'bloggerFrame');
}