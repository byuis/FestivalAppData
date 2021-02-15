// local
//const base = "https://127.0.0.1:5500" // local

//dev
//const base = "https://script.google.com/macros/s/AKfycbwssHJi8n6W5tjXMRxOyHHY2o3Ya2cTZK8OLCEhBEvf/dev"

//production

const base = "https://script.google.com/macros/s/AKfycbw2KAFCjQzBLKKl9EWjd9xLP7bRytQ6J-6Nt9uxGk0ZghMoIQW4QCbwfg/exec"


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


async function get_data(key,record_id,filter){
    let record_limit=5000
    let offset=""
    view_clause=""
    
    // data_router_2 owned by gove.allen
    
    let url=base + "?key=" + key

    if(record_id){
        url += "&id=" + record_id
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



async function show_form(){
    document.getElementById("personal").innerHTML =   `
    <h1>Edit Personal Information</h1>
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
        <button onclick=sumbit_form()>Update</button>
    </div>
    <div id="message" class="message">
    </div><br>
    </form>
    <h1>Edit Event Information</h1>
    <div class="data-text">
    This infomation will be available in the event app and website.  If you need access to other people or exhibits, send a request to the event coordinator.
    </div>
    <div id="Persona" style="margin-left:20px">
    <a href=>
    </div>
    `

    // get the data
    document.getElementById("message").innerHTML = "Requesting data . . ."
    
    // get data of person to be edited
    let participant = await get_data(param("key"), param("id"))
    document.getElementById("message").innerHTML = "Complete."

    if(participant.records[0].fields.firstName){document.getElementById("firstName").value=participant.records[0].fields.firstName}
    if(participant.records[0].fields.lastName){document.getElementById("lastName").value=participant.records[0].fields.lastName}
    if(participant.records[0].fields.oneLiner){document.getElementById("oneLiner").value=participant.records[0].fields.oneLiner}
    if(participant.records[0].fields.about){document.getElementById("about").value=participant.records[0].fields.about}
    if(participant.records[0].fields.email){document.getElementById("email").value=participant.records[0].fields.email}
    if(participant.records[0].fields.phone){document.getElementById("phone").value=participant.records[0].fields.phone}
    if(participant.records[0].fields.kind){document.getElementById(participant.records[0].fields.kind.toLowerCase().split(" ")[0]).checked=true}

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
            show_form()
    }
}