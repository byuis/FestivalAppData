// local
//const base = "https://127.0.0.1:5500" // local

//dev
//const base = "https://script.google.com/macros/s/AKfycbwssHJi8n6W5tjXMRxOyHHY2o3Ya2cTZK8OLCEhBEvf/dev"

//production

const base = "https://script.google.com/macros/s/AKfycbw2KAFCjQzBLKKl9EWjd9xLP7bRytQ6J-6Nt9uxGk0ZghMoIQW4QCbwfg/exec"

//test call on golive
//http://127.0.0.1:5500/system/editor.html?key=U2FsdGVkX19iysq-p2a3y9o5qoq89mQqTqsFsXsNSF7yXvPOezWzh4179AzGqGQXeoJfm_nwGlO8puwbPB5CSQ&id=reckde8AV0E4VtYYY&m=list
//https://byuis.github.io/FestivalAppData/system/editor.html?key=U2FsdGVkX19iysq-p2a3y9o5qoq89mQqTqsFsXsNSF7yXvPOezWzh4179AzGqGQXeoJfm_nwGlO8puwbPB5CSQ&id=reckde8AV0E4VtYYY&m=list

async function sumbit_form(key, id, kind){
    let message=""
    try{
        let url=base
        let json={
            key:key,
            id:id,
            records: [{
                fields: {
                }
            }]
        }
        json.records[0].id=id
        //  get portrayed data / who you will see
        const cast = []

        let message_tag = document.getElementById("message")
        console.log("at update", kind)
        if(kind==='participant'){
            // get single value data fields
            json.records[0].fields.firstName=document.getElementById("firstName").value
            json.records[0].fields.lastName=document.getElementById("lastName").value
            json.records[0].fields.address=document.getElementById("address").value
            json.records[0].fields.city=document.getElementById("city").value
            json.records[0].fields.state=document.getElementById("state").value
            json.records[0].fields.zip=document.getElementById("zip").value
            json.records[0].fields.email=document.getElementById("email").value
            json.records[0].fields.phone=document.getElementById("phone").value
        }else if(kind==='person'){
            for (const li of document.getElementById("portray_list").getElementsByTagName("li")) {
                cast.push(li.id)
            }            json.records[0].fields.portrayedBy=cast
            message_tag = document.getElementById("event_message")
            // get single value data fields
            json.records[0].fields.firstName=document.getElementById("p_firstName").value
            json.records[0].fields.lastName=document.getElementById("p_lastName").value
            json.records[0].fields.oneLiner=document.getElementById("p_oneLiner").value
            json.records[0].fields.about=document.getElementById("p_about").value
            json.records[0].fields.email=document.getElementById("p_email").value
            json.records[0].fields.phone=document.getElementById("p_phone").value
            json.records[0].fields.kind=get_radio_value("kind")
        }else{
            // exhibition
            console.log("ready to update exhibition")
            for (const li of document.getElementById("portray_list").getElementsByTagName("li")) {
                cast.push(li.id)
            }
            json.records[0].fields.People=cast
            // get single value data fields
            json.records[0].fields.name=document.getElementById("name").value
            json.records[0].fields.oneLiner=document.getElementById("oneLiner").value
            json.records[0].fields.description=document.getElementById("description").value
            json.records[0].fields.album=document.getElementById("album").value
            if(document.getElementById("duration").value){
                json.records[0].fields.duration=parseInt(document.getElementById("duration").value)
                if(Number.isNaN(json.records[0].fields.duration)){
                    message="Value entered for duration must be a number of minutes."
                    throw new error("Message")
                }
            }else{
                json.records[0].fields.duration=null
            }
        }    
        message_tag.innerHTML = "Updating Data . . ."
        console.log("json",JSON.stringify(json))
        let data="a="+encodeURIComponent(atob(param("a")))+"&json=" + encodeURIComponent(JSON.stringify(json))
        const headers={
            "Content-Type" : "application/x-www-form-urlencoded"
        }  
        const result = await axios.post(url, data, {headers: headers})
        console.log("result", result)
        message_tag.innerHTML = "Data Successfully Updated."
    }catch(e){
        if(!message){message="Error.  Data not updated."}
        console.error(e)
        document.getElementById("message").innerHTML = '<font color="red">'+message+'</font>'

    }
}

function get_radio_value(radio_name) { 
    for(const entry of document.getElementsByName(radio_name)) { 
        if(entry.checked){ 
          return entry.value; 
        }        
    } 
}


async function get_data(key,record_id,filter,append_params,table_name,field_list){
    //field list is a dash(-) separated list of field names.  Only works if filter is supplied is supplied
    let record_limit=5000
    let offset=""
    view_clause=""
    
    // data_router_2 owned by gove.allen
    
    let url=base + "?key=" + key
    url += "&id=" + record_id

    if(filter){
        url += "&f=" + encodeURIComponent(filter)
        if(field_list){
            url += "&cols=" + encodeURIComponent(field_list)
        }
    }

    if(table_name){
        url += "&t=" + table_name
    }

    if(append_params){url+=append_params}
    console.log("about to axios", url)
    const airtable={records:[]}
        do {
            let url2=url
            if(offset){
                url2=url + "&o=" + offset
            }
            const airtable_fetch = await axios.get(url2)
            console.log("airtable_fetch",airtable_fetch)
            if(airtable_fetch.data && airtable_fetch.data.error){
                // a GAS server rejection  we're done
                return airtable_fetch.data
            }
            if(airtable_fetch.data.records){
              airtable.records=airtable.records.concat(airtable_fetch.data.records)
            }else{
              airtable.records=airtable.records.concat(airtable_fetch.data)
            }
            document.getElementById("message").innerHTML = airtable.records.length + ' records received.'

            console.log("airtable_fetch.data.offset",airtable_fetch.data.offset)
            if (airtable_fetch.data.offset){
                offset=airtable_fetch.data.offset
            }else{
                offset=""
            }
            //logger.log({recordCount:airtable.records.length})()
        } while (offset!=="");

        
        return airtable
}

function param(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};



async function show_person(key, id){
    document.getElementById("output").style.display="inline-block"
    document.getElementById("output").innerHTML =   `
    <h1>Edit Person</h1>
    <div class="data-text">
    This is the data that will appear in the online program and app.
    </div>

    <form id="form" onsubmit="return false">

    <label id="icon" for="p_firstName"><i class="fas fa-user"></i></label>
    <input type="text" name="firstName" id="p_firstName" placeholder="First Name" required/>

    <label id="icon" for="p_lastName"><i class="fas fa-user"></i></label>
    <input type="text" name="lastName" id="p_lastName" placeholder="Last Name" required/>

    <label id="icon" for="p_oneLiner"><i class="fas fa-quote-right"></i></label>
    <input type="text" name="oneLiner" id="p_oneLiner" placeholder="Short Description" required/>

    <textarea name="about" id="p_about" placeholder="About"></textarea>

    <div class="gender">
    <input type="radio" value="Historic" id="historic" name="kind"  onclick="document.getElementById('portrayed').style.display = 'block'"/>
    <label for="historic" class="radio">Historic</label><br />
    <input type="radio" value="Fictional" id="fictional" name="kind"  onclick="document.getElementById('portrayed').style.display = 'block'"/>
    <label for="fictional" class="radio">Fictional</label><br />
    <input type="radio" value="Real Identities" id="real" name="kind" onclick="document.getElementById('portrayed').style.display = 'none'"/>
    <label for="real" class="radio">Real Identity</label>
    </div>

    <div id="portrayed" style="display:none">
    <label id="icon" for="portrayed_by"><i class="fas fa-mask"></i></label>
    <select name="portrayed_by" id="portrayed_by" placeholder="Portrayed By" onchange="change_protrayed_by()">
    <option value="">Portrayed By</option>
    </select>
    <ul id="portray_list" class="person">
    </ul>
    </div>

    <label id="icon" for="p_email"><i class="fas fa-envelope"></i></label>
    <input type="text" name="email" id="p_email" placeholder="Email Address" />

    <label id="icon" for="p_phone"><i class="fas fa-phone"></i></label>
    <input type="text" name="phone" id="p_phone" placeholder="Phone Number" />


    <div class="btn-block">
        <button onclick=sumbit_form("`+key+`","`+id+`",'person')>Update</button>
    </div>
    <div id="event_message" class="message">
    </div><br>
    </form>

    <h1>Image</h1>
    <img src="images/noimage.png" id="photo">
    <div id="review-photos">
    </div>
    <div style="margin-left:2rem;margin-right:2rem;">
        <a id="add-photo" target="photos" href="https://docs.google.com/forms/d/e/1FAIpQLScpnTEXgmL0ZYdCS6jHGdhzotEvk546aAMrO5NB39K8vfmgIQ/viewform?entry.884003671=` + key + " " + id + `">
            <button>Submit photo for review</button>
        </a>
    <div>
    `


    // get the data
    document.getElementById("message").innerHTML = "Requesting data . . ."
    
    // get data of person to be edited
    let person = await get_data(key, id)
    console.log("person",person)
    if(person.records[0].fields.image){document.getElementById("photo").src=person.records[0].fields.image[0].url}
    if(person.records[0].fields.firstName){document.getElementById("p_firstName").value=person.records[0].fields.firstName}
    if(person.records[0].fields.lastName){document.getElementById("p_lastName").value=person.records[0].fields.lastName}
    if(person.records[0].fields.oneLiner){document.getElementById("p_oneLiner").value=person.records[0].fields.oneLiner}
    if(person.records[0].fields.about){document.getElementById("p_about").value=person.records[0].fields.about}
    if(person.records[0].fields.email){document.getElementById("p_email").value=person.records[0].fields.email}
    if(person.records[0].fields.phone){document.getElementById("p_phone").value=person.records[0].fields.phone}
    if(person.records[0].fields.kind){document.getElementById(person.records[0].fields.kind.toLowerCase().split(" ")[0]).checked=true}

                                                
    console.log('document.getElementById("portrayed")',document.getElementById('portrayed'))
    document.getElementById("message").innerHTML = "Getting People . . ."

    // get list of real people to populate "portrayed by" drop down
    let d = await get_data(key, id, "kind='Real Identities'",null,'person','name')
    if(d.error){
        document.getElementById("message").innerHTML = "Error: " + d.error
        return
    }
    
    document.getElementById("message").innerHTML = "Checking for sumbitted photos . . ."
    
    const people=[]
    for(const person of d.records){
        people.push(person.fields.name +"|"+ person.id )
    }
    people.sort()
    for(const person of people){
        add_option(person)
    }
    document.getElementById('portrayed').style.display="block"
    if(person.records[0].fields.portrayedBy){
        for(const actor_id of person.records[0].fields.portrayedBy){
            document.getElementById('portrayed_by').value=actor_id
            change_protrayed_by()        
        }
    }

    if(document.getElementById("real").checked){
        document.getElementById('portrayed').style.display = 'none'
    }

    //get photo links    
    //await get_data( key,id,"kind='Real Identities'",,"photos")
    let photos = await get_data(key,id,"link_to_person='" + person.records[0].fields.name + "'",null,"photos","url-name")
    console.log("Photos",photos)
    document.getElementById("message").innerHTML = ""
    if(photos.records.length>0){
        let photo_text = "<h1>Photos for Review</h1>"
        for(const photo of photos.records){
            photo_text += '<a target="photos" href="'+photo.fields.url+'" class="photo">'+photo.fields.name+'</a><br />'
        }
        document.getElementById("review-photos").innerHTML = photo_text
    }
    
    
};


async function show_exhibition(key, id){
    document.getElementById("output").style.display="inline-block"
    document.getElementById("output").innerHTML =   `
    <h1>Edit Exhibition</h1>
    <div class="data-text">
    This is the data that will appear in the online program and app.
    </div>

    <form id="form" onsubmit="return false">

    <label id="icon" for="name"><i class="fas fa-landmark"></i></label>
    <input type="text" name="name" id="name" placeholder="Name" required/><br />

    <label id="icon" for="oneLiner"><i class="fas fa-quote-right"></i></label>
    <input type="text" name="oneLiner" id="oneLiner" placeholder="Short Description" required/><br />

    <textarea name="description" id="description" placeholder="Description"></textarea>

    <div id="portrayed" style="display:none">
    <label id="icon" for="portrayed_by"><i class="fas fa-user"></i></label>
    <select name="portrayed_by" id="portrayed_by" placeholder="Folks you'll see" onchange="change_protrayed_by()">
    <option value="">You can expect to see . . .</option>
    </select>
    <ul id="portray_list" class="person">
    </ul>
    </div>

    <label id="icon" for="album" style="width:15px"><i class="fas fa-images"></i></label>
    <input type="text" name="album" id="album" placeholder="Link to Album" title="A link to a web page.  It will be labled as &quot;Album&quot; in the app, but it can be any external web page that you would like users to link to."/><br />

    <label id="icon" for="duration"><i class="fas fa-clock"></i></label>
    <input type="text" name="duration" id="duration" placeholder="Number of minutes or blank" title="If this exhibition is open for folks to come and go as the please, leave this blank, otherwise, specify the number of minutes the presentation takes." /><br />


    <div class="btn-block">
        <button onclick=sumbit_form("`+key+`","`+id+`",'exhibition')>Update</button>
    </div>
    <div id="message" class="message">
    </div><br>
    </form>
    <h1>Image</h1>
    <img src="images/noimage.png" id="photo">
    <div id="review-photos">
    </div>
    <div style="margin-left:2rem;margin-right:2rem;">
        <a id="add-photo" target="photos" href="https://docs.google.com/forms/d/e/1FAIpQLScpnTEXgmL0ZYdCS6jHGdhzotEvk546aAMrO5NB39K8vfmgIQ/viewform?entry.884003671=` + key + " " + id + `">
            <button>Submit photo for review</button>
        </a>
    <div>
    `


    // get the data
    document.getElementById("message").innerHTML = "Requesting data . . ."
    
    // get data of exhibition to be edited
    let exhibition = await get_data(key, id)
    console.log("exhibition",exhibition)
    if(exhibition.records[0].fields.image){document.getElementById("photo").src=exhibition.records[0].fields.image[0].url}
    if(exhibition.records[0].fields.name){document.getElementById("name").value=exhibition.records[0].fields.name}
    if(exhibition.records[0].fields.oneLiner){document.getElementById("oneLiner").value=exhibition.records[0].fields.oneLiner}
    if(exhibition.records[0].fields.description){document.getElementById("description").value=exhibition.records[0].fields.description}
    if(exhibition.records[0].fields.album){document.getElementById("album").value=exhibition.records[0].fields.album}
    if(exhibition.records[0].fields.duration){document.getElementById("duration").value=exhibition.records[0].fields.duration}

                                                
    console.log('document.getElementById("portrayed")',document.getElementById('portrayed'))
    document.getElementById("message").innerHTML = "Getting People . . ."

    // get list of real people to populate "you can expect to see" drop down
    let d = await get_data(key, id, "len(kind)>1",null,'person','name')
    console.log("d",d)
    if(d.error){
        document.getElementById("message").innerHTML = "Error: " + d.error
        return
    }
    
    document.getElementById("message").innerHTML = "Checking for sumbitted photos . . ."
    
    const people=[]
    for(const person of d.records){
        people.push(person.fields.name +"|"+ person.id )
    }
    people.sort()
    for(const person of people){
        add_option(person)
    }
    document.getElementById('portrayed').style.display="block"
    console.log("exhibition",exhibition)
    if(exhibition.records[0].fields.People){
        for(const actor_id of exhibition.records[0].fields.People){
            console.log("actor_id", actor_id)
            document.getElementById('portrayed_by').value=actor_id
            change_protrayed_by()        
        }
    }



    //get photo links    
    //await get_data( key,id,"kind='Real Identities'",,"photos")
    let photos = await get_data(key,id,"link_to_exhibition='" + exhibition.records[0].fields.name + "'",null,"photos","url-name")
    console.log("Photos",photos)
    document.getElementById("message").innerHTML = ""
    if(photos.records.length>0){
        let photo_text = "<h1>Photos for Review</h1>"
        for(const photo of photos.records){
            photo_text += '<a target="photos" href="'+photo.fields.url+'" class="photo">'+photo.fields.name+'</a><br />'
        }
        document.getElementById("review-photos").innerHTML = photo_text
    }
    
    
};

async function new_person(key,id){
    let url=base + "?m=np&key=" + key + "&id=" + id
    const person = await axios.get(url)
    console.log("person", person)
    if(person.data && person.data.records && person.data.records[0].fields.firstName==="New Person"){
        const newDiv = document.createElement("div");
        newDiv.innerHTML='<figure onclick="show_person(\''+person.data.records[0].key+'\',\''+person.data.records[0].id+'\')"><img src="images/noimage.png" class="img-card"><figcaption>'+person.data.records[0].fields.firstName+'</figcaption></figure>'
        document.getElementById("card_holder").appendChild(newDiv)
    }
}
async function new_exhibition(key,id){
    let url=base + "?m=ne&key=" + key + "&id=" + id
    const exhibition = await axios.get(url)
    console.log("exhibition", exhibition)
    if(exhibition.data && exhibition.data.records && exhibition.data.records[0].fields.name==="New Exhibit"){
        const newDiv = document.createElement("div");
        newDiv.innerHTML='<figure onclick="show_exhibition(\''+exhibition.data.records[0].key+'\',\''+exhibition.data.records[0].id+'\')"><img src="images/noimage.png" class="img-card"><figcaption>'+exhibition.data.records[0].fields.name+'</figcaption></figure>'
        document.getElementById("card_holder").appendChild(newDiv)
    }
}


async function show_participant(){
    document.getElementById("personal").innerHTML =   `
    <h1>Edit Individual Information</h1>
    <div class="data-text">
    This data is only for use by event coordinators.  It will not show in the app or online.
    </div>
    <form id="form" onsubmit="return false">

    <label id="icon" for="firstName"><i class="fas fa-user"></i></label>
    <input type="text" name="firstName" id="firstName" placeholder="First Name" required/>

    <label id="icon" for="lastName"><i class="fas fa-user"></i></label>
    <input type="text" name="lastName" id="lastName" placeholder="Last Name" required/>

    <label id="icon" for="email"><i class="fas fa-envelope"></i></label>
    <input type="text" name="email" id="email" placeholder="Email Address"/>

    <label id="icon" for="phone"><i class="fas fa-phone"></i></label>
    <input type="text" name="phone" id="phone" placeholder="Phone Number"/>

    <label id="icon" for="address"><i class="fas fa-home"></i></label>
    <input type="text" name="address" id="address" placeholder="Street Address"/>
    <input type="text" name="city" id="city" placeholder="City" style="width:133px; border-radius:5px;margin-left:50px"/>
    <input type="text" name="state" id="state" placeholder="State" style="width:40px; border-radius:5px;margin-left:5px"/>
    <input type="text" name="zip" id="zip" placeholder="ZIP" style="width:60px; border-radius:5px;margin-left:5px"/>

    <div class="btn-block">
        <button onclick=sumbit_form("`+param("key")+`","`+param("id")+`",'participant')>Update</button>
    </div>
    <div id="message" class="message">
    </div><br>
    </form>
    <div id="links" >
    </div>
    `

    // get the data
    document.getElementById("message").innerHTML = "Requesting Personal data . . ."
    
    // get data of person to be edited
    let participant = await get_data(param("key"), param("id"),"","&m=list")
    //console.log("participant",participant)
    if(participant.records[0].fields.firstName){document.getElementById("firstName").value=participant.records[0].fields.firstName}
    if(participant.records[0].fields.lastName){document.getElementById("lastName").value=participant.records[0].fields.lastName}
    if(participant.records[0].fields.email){document.getElementById("email").value=participant.records[0].fields.email}
    if(participant.records[0].fields.phone){document.getElementById("phone").value=participant.records[0].fields.phone}
    if(participant.records[0].fields.address){document.getElementById("address").value=participant.records[0].fields.address}
    if(participant.records[0].fields.city){document.getElementById("city").value=participant.records[0].fields.city}
    if(participant.records[0].fields.state){document.getElementById("state").value=participant.records[0].fields.state}
    if(participant.records[0].fields.zip){document.getElementById("zip").value=participant.records[0].fields.zip}

    const cards=['<h1>Edit Event Information</h1><div class="data-text">This infomation will be available in the event app and website.  If you need access to other people or exhibits, send a request to the event coordinator.</div><div><button  title="This will add a new person (historic, fictional, or a real identiy) to be included in the program." style="margin-left:20px;width:100px" onclick="new_person(\''+param("key")+'\',\''+param("id")+'\')">Add Person</button><button title="This will add a new exhibit to be included in the program." style="margin-left:10px;width:130px" onclick="new_exhibition(\''+param("key")+'\',\''+param("id")+'\')">Add Exhibition</button></div><div id="card_holder" style="display: flex;justify-content: center;margin-top:10px;margin-left:10px;flex-wrap: wrap;">']
    console.log("participant",participant)
    for(link of participant.records[0].person_links){
        //console.log("link",link)
        cards.push('<figure onclick="show_person(\''+link.key+'\',\''+link.id+'\')"><img src="'+link.image+'" alt="'+link.name+'" class="img-card"><figcaption>'+link.name+'</figcaption></figure>')
    } 
    for(link of participant.records[0].exhibition_links){
        cards.push('<figure onclick="show_exhibition(\''+link.key+'\',\''+link.id+'\')"><img src="'+link.image+'" alt="'+link.name+'" class="img-card"><figcaption>'+link.name+'</figcaption></figure>')
    } 
    cards.push("</div>")

    document.getElementById("links").innerHTML = cards.join("")

    

}
function change_protrayed_by(){
    const sel = document.getElementById("portrayed_by")
    if (sel.selectedIndex === 0){return}
    const ul = document.getElementById("portray_list")
    let li = document.createElement("li")
    
    li.onclick=function(){this.remove()}
    li.appendChild(document.createTextNode(sel.options[sel.selectedIndex].text))
    li.id=sel.value
    ul.appendChild(li)
    sel.selectedIndex=0
}

function add_option(text){
    let display = text.split("|")[0]
    let value = text.split("|")[1]
    var sel = document.getElementById('portrayed_by')
    var opt = document.createElement('option')
    opt.appendChild( document.createTextNode(display) )
    opt.value = value
    sel.appendChild(opt)
}

function start_me_up(){
    switch (param("c")){
        case "Import":
            import_data()
            break
        default:
            show_participant()
    }
}