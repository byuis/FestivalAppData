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
    
    // data_router_2 owned by gove.allen
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



async function show_form(){
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