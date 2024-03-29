const base="https://byuis.github.io/FestivalAppData"
async function sumbit_form(){
    let key=document.getElementById("key").value
    let table = "person"
    if(document.getElementById("exhibition").checked){
        table="exhibition"
    }
    console.log(table)
    if(!key){
        document.getElementById("message").innerHTML = '<font color="red">Key is required<font>'
    }else{
        document.getElementById("message").innerHTML = "Requesting data . . ."
        const data = await get_data(table, key)
        console.log(data)
        document.getElementById("message").innerHTML = ""
        const lines=[]
        lines.push('<table>')
        for(const record of data.records){
            let name=record.fields.name
            if(!name){
                name=record.fields.firstName+" "+record.fields.lastName
            }
            lines.push('<tr><td><a target="edit" href="' + base + '/system/edit.html?a='+btoa(record.id.substr(3)+'_'+key+'_'+table)+'">' + name + '</a></td><td>'+record.fields.oneLiner+'</td></tr>')
        }
        lines.push("</table>")


        document.getElementById(table+"_div").innerHTML = lines.join("\n")

    }
    function append_person_row(){

    }
}



async function get_data(table, key){
    let record_limit=5000
    let offset=""
    view_clause=""
    
    // data_router owned by gove.allen
    const url="https://script.google.com/macros/s/AKfycbyQzFFPgzU_Qc_brWj55o_y36dFZOYYzNFdGI2YmE8Kz5unizU/exec?a=" + key + "&t=" + table
    //logger.debug("about to axios", url)()
    const airtable={records:[]}
        do {
            let url2=url
            if(offset){
                url2=url + "&o=" + offset
            }
            const airtable_fetch = await axios.get(url2)
            airtable.records=airtable.records.concat(airtable_fetch.data.records)
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



function show_from(){
    console.log("param",param("a"))
    document.getElementById("output").innerHTML =   `
    <h1>Admin Tools</h1>
    <form id="form" onsubmit="return false">
      <label id="icon" for="key"><i class="fas fa-key"></i></label>
      <input type="text" name="key" id="key" placeholder="Key" value="`+param("a")+`"/>

      <div class="gender">
      <input type="radio" value="person" id="person" name="table" checked/>
      <label for="person" class="radio">Person</label><br />
      <input type="radio" value="exhibition" id="exhibition" name="table" />
      <label for="exhibition" class="radio">Exhibition</label>
      </div>

      <div class="btn-block">
      <button title="Build links to send to individuals to let them edit thier own data." onclick="sumbit_form()">Build Edit-Data Links</button>
      <hr>
      <button onclick="preview()" title="Preview data from Airtable as structured for the Franklin Event Guide.">Preview App Data</button>
      <label id="icon" for="git"><i class="fas fa-code-branch"></i></label>
      <input type="text" name="git" id="git" placeholder="Key for Git-Hub" value="`+param("t")+`"/>

      <button onclick="publish()" title="Publish data from Airtable to Franklin Event Guide." >Publish App Data</button>
        <hr>
      <button onclick="buildLink()" title="Supply a github token along with Airtble API Key and Base ID to build a shareable link" >Build Custom Link</button>


      
      </div>
      <div id="message" class="message">
        
      </div>
    </form>
    `
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

function publish(){
    window.location.href = 'convert.html?a=key'+reverseString(document.getElementById("key").value.split("_")[0])+'&b=app'+reverseString(document.getElementById("key").value.split("_")[1])+'&c=Publish&t=' + document.getElementById("git").value ;
}
function buildLink(){
    var api_key = prompt("Enter your Airtable API Key.  Found at airtable.com/account");
    if(!api_key){return}
    var base_id = prompt("Enter your Airtable Base ID.  Found at airtable.com/api");
    if(!base_id){return}
    var github = prompt("Enter your github personal access token (optional).  Found at https://github.com/settings/tokens/");
    if(github){
        window.location.href = 'admin.html?a='+reverseString(api_key.substr(3))+'_'+reverseString(base_id.substr(3))+'&t=' + github
    }else{
        window.location.href = 'admin.html?a='+reverseString(api_key.substr(3))+'_'+reverseString(base_id.substr(3))
    }
}
function preview(){
    window.location.href = 'convert.html?a=key'+reverseString(document.getElementById("key").value.split("_")[0])+'&b=app'+reverseString(document.getElementById("key").value.split("_")[1])+'&c=Preview' ;
}


function reverseString(str) {
    return str.split("").reverse().join("")
}