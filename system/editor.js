const base="https://127.0.0.1:5500"
//http://127.0.0.1:5500/system/admin.html?a=keybjicCPz1uh4l6C&b=apptTLyjlZBF2tZVZ
async function sumbit_form(){
    let message=""
    try{

        let code=atob(param("a")).split("_")
        console.log("code",code)
        document.getElementById("message").innerHTML = "Updating Data . . ."
        let url="https://script.google.com/macros/s/AKfycbyQzFFPgzU_Qc_brWj55o_y36dFZOYYzNFdGI2YmE8Kz5unizU/exec"
        let json={
            records: [{
                fields: {
                }
            }]
        }
        json.records[0].id="rec"+code[0]  
        //  get portrayed data / who you will see
        const cast = []
        for (const li of document.getElementById("portray_list").getElementsByTagName("li")) {
            cast.push(li.id)
        }

        if(code[3]==='person'){
            json.records[0].fields.portrayedBy=cast
            // get single value data fields
            json.records[0].fields.firstName=document.getElementById("firstName").value
            json.records[0].fields.lastName=document.getElementById("lastName").value
            json.records[0].fields.oneLiner=document.getElementById("oneLiner").value
            json.records[0].fields.about=document.getElementById("about").value
            json.records[0].fields.email=document.getElementById("email").value
            json.records[0].fields.phone=document.getElementById("phone").value
            json.records[0].fields.kind=get_radio_value("kind")
        }else{
            // exhibition
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
        console.log("json",json)
        let data="a="+encodeURIComponent(atob(param("a")))+"&json=" + encodeURIComponent(JSON.stringify(json))
        const headers={
            "Content-Type" : "application/x-www-form-urlencoded"
        }  
        const result = await axios.post(url, data, {headers: headers})
        console.log("result", result)
        document.getElementById("message").innerHTML = "Data Successfully Updated."
    }catch(e){
        if(!message){message="Error.  Data not updated."}
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


async function get_data(table, key,record_id,  filter){
    let record_limit=5000
    let offset=""
    view_clause=""
    
    // data_router owned by gove.allen
    let url="https://script.google.com/macros/s/AKfycbyQzFFPgzU_Qc_brWj55o_y36dFZOYYzNFdGI2YmE8Kz5unizU/exec?a=" + key + "&t=" + table 
    if(record_id){
        url += "&r=" + record_id
    }else if(filter){
        url += "&f=" + encodeURIComponent(filter)
    }
    console.log("about to axios", url)
    const airtable={records:[]}
        do {
            let url2=url
            if(offset){
                url2=url + "&o=" + offset
            }
            const airtable_fetch = await axios.get(url2)
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



async function show_from(){
    let code=atob(param("a")).split("_")
    console.log("code",code)
    if(code[3]==='person'){
        document.getElementById("output").innerHTML =   `
        <h1>Edit Person</h1>
        <form id="form" onsubmit="return false">

        <label id="icon" for="firstName"><i class="fas fa-user"></i></label>
        <input type="text" name="firstName" id="firstName" placeholder="First Name" required/>

        <label id="icon" for="lastName"><i class="fas fa-user"></i></label>
        <input type="text" name="lastName" id="lastName" placeholder="Last Name" required/>

        <label id="icon" for="oneLiner"><i class="fas fa-quote-right"></i></label>
        <input type="text" name="oneLiner" id="oneLiner" placeholder="Short Description" required/>

        <textarea name="about" id="about" placeholder="About"></textarea>

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

        <label id="icon" for="email"><i class="fas fa-envelope"></i></label>
        <input type="text" name="email" id="email" placeholder="Email Address" />

        <label id="icon" for="phone"><i class="fas fa-phone"></i></label>
        <input type="text" name="phone" id="phone" placeholder="Phone Number" />


        <div class="btn-block">
            <button onclick=sumbit_form()>Update</button>
        </div>
        <div id="message" class="message">
        </div><br>
        </form>
        `
        document.getElementById("photos").innerHTML =   `
        <h1>Image</h1>
        <img src="images/noimage.png" id="photo">
        <div id="review-photos">
        </div>
        <div style="margin-left:2rem;margin-right:2rem;">
            <a id="add-photo" target="photos" href="https://docs.google.com/forms/d/e/1FAIpQLScpnTEXgmL0ZYdCS6jHGdhzotEvk546aAMrO5NB39K8vfmgIQ/viewform?entry.884003671=`+param("a")+`">
                <button>Submit photo for review</button>
            </a>
        <div>
        `


        // get the data
        document.getElementById("message").innerHTML = "Requesting data . . ."
        
        // get data of person to be edited
        let person = await get_data(code[3], code[1]+"_"+code[2], code[0])
        if(person.records[0].fields.image){document.getElementById("photo").src=person.records[0].fields.image[0].url}
        if(person.records[0].fields.firstName){document.getElementById("firstName").value=person.records[0].fields.firstName}
        if(person.records[0].fields.lastName){document.getElementById("lastName").value=person.records[0].fields.lastName}
        if(person.records[0].fields.oneLiner){document.getElementById("oneLiner").value=person.records[0].fields.oneLiner}
        if(person.records[0].fields.about){document.getElementById("about").value=person.records[0].fields.about}
        if(person.records[0].fields.email){document.getElementById("email").value=person.records[0].fields.email}
        if(person.records[0].fields.phone){document.getElementById("phone").value=person.records[0].fields.phone}
        if(person.records[0].fields.kind){document.getElementById(person.records[0].fields.kind.toLowerCase().split(" ")[0]).checked=true}

                                                    
        console.log('document.getElementById("portrayed")',document.getElementById('portrayed'))
        document.getElementById("message").innerHTML = "Getting People . . ."

        // get list of real people to populate "portrayed by" drop down
        let d = await get_data(code[3], code[1]+"_"+code[2], "","kind='Real Identities'")
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
        let photos = await get_data("Photos", code[1]+"_"+code[2], "","link_to_person='" + person.records[0].fields.name + "'")
        console.log("Photos",photos)
        document.getElementById("message").innerHTML = ""
        if(photos.records.length>0){
            let photo_text = "<h1>Photos for Review</h1>"
            for(const photo of photos.records){
                photo_text += '<a target="photos" href="'+photo.fields.url+'" class="photo">'+photo.fields.name+'</a><br />'
            }
            document.getElementById("review-photos").innerHTML = photo_text
        }
        
        
        
    }else{
        // exhibition
        document.getElementById("output").innerHTML =   `
        <h1>Edit Exhibition</h1>
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
        <input type="text" name="album" id="album" placeholder="Link to Album" /><br />

        <label id="icon" for="duration"><i class="fas fa-clock"></i></label>
        <input type="text" name="duration" id="duration" placeholder="Number of minutes or blank" /><br />


        <div class="btn-block">
            <button onclick=sumbit_form()>Update</button>
        </div>
        <div id="message" class="message">
        </div><br>
        </form>
        `
        document.getElementById("photos").innerHTML =   `
        <h1>Image</h1>
        <img src="images/noimage.png" id="photo">
        <div id="review-photos">
        </div>
        <div style="margin-left:2rem;margin-right:2rem;">
            <a id="add-photo" target="photos" href="https://docs.google.com/forms/d/e/1FAIpQLScpnTEXgmL0ZYdCS6jHGdhzotEvk546aAMrO5NB39K8vfmgIQ/viewform?entry.884003671=`+param("a")+`">
                <button>Submit photo for review</button>
            </a>
        <div>
        `


        // get the data
        document.getElementById("message").innerHTML = "Requesting data . . ."
        // get data of person to be edited
        let person = await get_data(code[3], code[1]+"_"+code[2], code[0])
        console.log("person", person)
        if(person.records[0].fields.image){document.getElementById("photo").src=person.records[0].fields.image[0].url}
        if(person.records[0].fields.name){document.getElementById("name").value=person.records[0].fields.name}
        if(person.records[0].fields.oneLiner){document.getElementById("oneLiner").value=person.records[0].fields.oneLiner}
        if(person.records[0].fields.description){document.getElementById("description").value=person.records[0].fields.description}
        if(person.records[0].fields.album){document.getElementById("album").value=person.records[0].fields.album}
        if(person.records[0].fields.duration){document.getElementById("duration").value=person.records[0].fields.duration}

        document.getElementById("message").innerHTML = "Getting People . . ."

        // get list of real people to populate "portrayed by" drop down
        let d = await get_data("person", code[1]+"_"+code[2])
        document.getElementById("message").innerHTML = "Checking for sumbitted photos . . ."
        console.log("people", d)
        const people=[]
        for(const person of d.records){
            people.push(person.fields.name +" (" + person.fields.kind + ")|"+ person.id )
        }
        people.sort()
        for(const person of people){
            add_option(person)
        }
        document.getElementById('portrayed').style.display="block"
        if(person.records[0].fields.People){
            for(const actor_id of person.records[0].fields.People){
                document.getElementById('portrayed_by').value=actor_id
                change_protrayed_by()        
            }
        }

        //get photo links    
        let photos = await get_data("Photos", code[1]+"_"+code[2], "","link_to_exhibition='" + person.records[0].fields.name + "'")
        console.log("Photos",photos)
        document.getElementById("message").innerHTML = ""
        if(photos.records.length>0){
            let photo_text = "<h1>Photos for Review</h1>"
            for(const photo of photos.records){
                photo_text += '<a target="photos" href="'+photo.fields.url+'" class="photo">'+photo.fields.name+'</a><br />'
            }
            document.getElementById("review-photos").innerHTML = photo_text
        }
        
        
        



    }
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
            show_from()
    }
}