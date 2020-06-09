let token
let base_id
let errors=[]
let destination

async function import_data(){
    const response = await axios.get(param('t'))
    const json_file = response.data
    document.getElementById("output").innerHTML="<pre>"+JSON.stringify(json_file," ",4)+"</pre>"
    console.log(json_file.schedule)
    let base_id = param("b")
    let token=param("a")

    await people()
    await exhibitions()

    // import people
    async function people(){
        for(let group_counter=json_file.speakerGroups.length-1;group_counter>-1;group_counter--){
            const group = json_file.speakerGroups[group_counter]
            let speaker_counter=-1
            for(const speaker of group.speakers){
                speaker_counter++
                let names = speaker.name.split(" ")
                let last_name = names.pop()
                let first_name = names.join(" ")

                console.log(group.kind, last_name, first_name)
                let data={records:[{fields:{}}],typecast:true} 
                data.records[0].fields.firstName = first_name
                data.records[0].fields.lastName = last_name
                data.records[0].fields.image=[{url: speaker.image}]
                if(speaker.icon){data.records[0].fields.icon=[{url: speaker.icon}]}
                add_field("about", data, speaker)
                add_field("oneLiner", data, speaker)
                add_field("email", data, speaker)
                add_field("kind", data, speaker)
                add_field("phone", data, speaker)
                if(speaker.portrayedBy){
                    let portrayedBy = get_atid(speaker.portrayedBy[0])
                    data.records[0].fields.portrayedBy=[portrayedBy]
                }


                const table = "Person"
                const url="https://api.airtable.com/v0/" + base_id + "/" + table 
                console.log("about to axios", url, token)
                const headers={ headers: { 'Content-Type': 'application/json',  Authorization: 'Bearer ' + token }}
                console.log(headers)
                console.log(data)
                const airtable_post = await axios.post(url, data, headers)    
                console.log ("response",airtable_post.data.records[0].id)
                json_file.speakerGroups[group_counter].speakers[speaker_counter].atid = airtable_post.data.records[0].id
                console.log(json_file.speakerGroups[group_counter].speakers[speaker_counter])





                
            }

        }
    }

    // import exhibitions
    async function exhibitions(){
        for(const day of json_file.schedule){
            for(const group of day.groups){
                console.log("Group Label", group.groupLabel)
                for(const session of group.sessions){
                    let data={records:[{fields:{}}],typecast:true} 
                    if(session.icon){data.records[0].fields.icon=[{url: session.icon}]}
                    if(session.image){data.records[0].fields.image=[{url: session.image}]}
                    add_field("name", data, session)
                    add_field("description", data, session)
                    add_field("oneLiner", data, session)
                    add_field("album", data, session)
                    if(session.speakerNames){
                        data.records[0].fields.People=[]
                        for(person of session.speakerNames){
                            let one_person = get_atid(person)
                            if(one_person){
                                data.records[0].fields.People.push(one_person)
                            }
                        }
                        
                    }
                    const table = "Exhibition"
                    const url="https://api.airtable.com/v0/" + base_id + "/" + table 
                    console.log("about to axios", url, token)
                    const headers={ headers: { 'Content-Type': 'application/json',  Authorization: 'Bearer ' + token }}
                    console.log(headers)
                    console.log(data)
                    const airtable_post = await axios.post(url, data, headers)    
                    console.log ("response",airtable_post.data.records[0].id)
                    
                }
            }
        }
    }



    function add_field(field, data, speaker){
        if(speaker[field]){data.records[0].fields[field]=speaker[field]}
    }

    function get_atid(name){
        for(const group of json_file.speakerGroups){
            for(const speaker of group.speakers){
                if (speaker.name===name){
                    return speaker.atid
                }
            }
        }
        return null
    }

}



function add_once(array, value){//adds a value to an array if it does not alreay include it
  if(!array.includes(value)){
    array.push(value)
  }
}

function get_day(d){
    var the_date = new Date(d);
    return the_date.getFullYear().toString() + "-" +
           ("0" + (the_date.getMonth()+1).toString()).slice(-2) + "-" +
           ("0" + (the_date.getDate()).toString()).slice(-2)
}
function get_time(d, delay){
    var the_date = new Date(d)
    the_date.setMinutes(the_date.getMinutes()+(delay ? delay :0))
    let hour=the_date.getHours()
    let ampm="am"
    if (hour>11){ampm=pm}
    if (hour>12){hour=hour-12}
    return hour + ":" +
           ("0" + (the_date.getMinutes()).toString()).slice(-2) + " " + ampm
}



async function get_data(table,view){
    let record_limit=5000
    let filter_by_formula = ""
    let offset=""
    view_clause=""
    if(view){view_clause="view="+view+"&"}
    const url="https://api.airtable.com/v0/" + base_id + "/" + table + "?"+view_clause+"maxRecords=" + record_limit + filter_by_formula
    //logger.debug("about to axios", url)()
    const airtable={records:[]}
        do {
        const airtable_fetch = await axios.get(
            url + offset,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded',  Authorization: 'Bearer ' + token }}
        )
        airtable.records=airtable.records.concat(airtable_fetch.data.records)
        if(table==='Exhibition'){
        }
        //logger.debug("airtable_fetch.data.offset",airtable_fetch.data.offset)()
        if (airtable_fetch.data.offset){
            offset="&offset=" + airtable_fetch.data.offset
        }else{
            offset=""
        }
        //logger.log({recordCount:airtable.records.length})()
        } while (offset!=="");

        //logger.log("Done with airtable get", airtable)()
            return airtable
}

function param(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};



function show_from(){
    document.getElementById("output").innerHTML =   `
<div style="margin:2rem">
    <form>
        <h1>Franklin Event Guide importer</h1>
        Import data from a franklin event guide data file into an airtable base
        <table>
            <tr>
                <td><a target="_blank" href="https://airtable.com/account">API Key</a></td>
                <td><input name="a" type="text" size="30" value="${param('a')}" /></td>
            </tr>
            <tr>
                <td><a target="_blank" href="https://airtable.com/api">Base ID</a></td>
                <td><input name="b" type="text" size="30" value="${param('b')}"/></td>
            </tr>
            <tr>
                <td>Frnklin JSON file</td>
                <td><input name="t" type="text" size="30" value="${param('t')}"/></td>
            </tr>
            <tr>
                <td colspan=2><input type="submit" name="c" value="Import"/></td>
            </tr>
        
        
        </table>
    </form>
</div>
`
}
async function publish(data, file_path){
    //post data to github  
    //data is a json string of the festival info
    document.getElementById("output").innerHTML = "Communicating with github.com"
    const url="https://api.github.com/repos/byuis/FestivalAppData/contents/"
    const token = param("t")

    let request_data={
        method:"GET",
        url: url + file_path,
        headers:{ Authorization: 'token ' + token}
    }

    request_body={
        message: 'Publishing Changes',
        content: btoa(data)
    }

    request_headers={
        headers: { Authorization: 'token ' + token}
    }

    // get the sha or discover that the file not exists


    try{
        const response = await axios.get(url + file_path,request_headers)
        console.log(request_data)
        request_body.sha=response.data.sha
        console.log("sha",response.data.sha)
    }catch(err){
        if (err.message.includes("40")){
            // the file requested does not ytet exist on the server
            console.log("404", "file not on server, no need to include its sha")
            
        }
    } 

console.log(request_data)

    // update the file
    const response = await axios.put(url+file_path,request_body,request_headers)
    console.log(response);
    
    if(response.status===200){
        document.getElementById("output").innerHTML = "Success"
    }else{
        document.getElementById("output").innerHTML = JSON.stringify(response,"",4)
    }
        
   

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