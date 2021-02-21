let token
let base_id
let errors=[]
let destination

async function convert(final_destination){
    console.log("at Convert")
    destination=final_destination
    const air_data={responses:0,requests:0}

    // set the credentials
    token = param('a')
    base_id = param('b')
    if(token==='' || base_id===''){return}
    console.log("got credentials")

    //we have a token and a base id, let's get the data
    get_one_air_table("Event", air_data)
    get_one_air_table("Person", air_data, "list")
    get_one_air_table("Exhibition", air_data)
    get_one_air_table("Location", air_data, "list")
    get_one_air_table("Interest", air_data, "list")
    get_one_air_table("Schedule", air_data, "list")
    get_one_air_table("Link", air_data, "list")
    get_one_air_table("Page", air_data, "list")
    get_one_air_table("Introduction", air_data, "list")
    

}

function build_festival_data(air_data){
  const app_data={}
  if(air_data.requests > air_data.responses){return}
  // we have the data, let's process it
  console.log("we have the data", air_data)
  app_data.event=get_event(air_data)
  app_data.schedule=get_schedule(air_data)
  app_data.speakerGroups=get_speakerGroups(air_data)
  app_data.linkPages=get_linkPages(air_data)
  app_data.interests=get_interests(air_data)
  app_data.map=get_map(air_data)
  app_data.intro=get_intro(air_data)
  console.log("app_data", app_data)
  console.log("errors",errors)

  if(destination==="Preview"){
    document.getElementById("output").innerHTML = "<pre>" + JSON.stringify(app_data,"",4) + "</pre>"
  }else{
    publish(JSON.stringify(app_data), air_data.Event.records[0].fields.data_path)
  }
}


function get_linkPages(air_data){// copies linkPage data from airtable to app_data format
    const data=[]  
    let id=1
    for(record of air_data.Page.records){
        const page = copy_attributes(record.fields, ['page', 'ionIcon']) 
        page.id = record.id 
        page.linkGroups=[]
        // iterate over the links and put 
        data.push(page)
    }
    // add link pages
    for(const link of air_data.Link.records){
        const one_link = copy_attributes(link.fields,  ['linkText','url','location','size','description','height','group'])
        one_link.image=get_image(link.fields, "image")
        // loop across the pages to find where it belongs
        for(page of data){
            if(page.id===link.fields.page[0]){
                //found the page, now check to see if it has a link group with the link's group
                let found_it=false
                for(link_group of page.linkGroups){
                    if(link_group.group===link.fields.group){
                        // the page already has a link group with this group name
                        link_group.links.push(one_link)
                        found_it=true
                        break//no need to keep looking for the link group
                    }
                }
                if(!found_it){
                    // looked through all linkGroups for page and did not find a match, need to add it
                    page.linkGroups.push({group:one_link.group,links:[one_link]})
                }
                break//no need to keep looking for the page
            }
        }
        
    }
    for(page of data){
        // we need to correct any undefined groups in the linkgroups
        for(link_group of page.linkGroups){
            if(!link_group.group){link_group.group=""}
        }
        page.id = id++
    }

    return data
}

function get_link(air_data, ){// copies map linkGroup from airtable to app_data format
    const data=[]  
    for(record of air_data.Location.records){
      data.push(copy_attributes(record.fields, ['name', 'lat', 'lng']))
    }
    return data
}



function get_schedule(air_data){// copies person data from airtable to app_data format
    let id = 1
    const data=[{date:'',groups:[{groupLabel:'Exhibits',sessions:[]}]}]  
    // build the set of exhibits
    for(const record of air_data.Exhibition.records){
        const exhibit = fill_exhibition(air_data, record)
        if(!exhibit.timeEnd){
            exhibit.id = id++
            data[0].groups[0].sessions.push(exhibit)
        }

    }


    // build an array of presentations 
    const days=[]
    for(record of air_data.Schedule.records){
        const block=copy_attributes(record.fields, ['time_block','presentations','delay','label_override'])  
        if(block.presentations){
            for(const one_item of block.presentations){
                const date_label = get_day(block.time_block)
                const group_label = block.label_override?block.label_override:get_time(block.time_block)
                // add the day if needed
                if(days.length===0){
                    // need to add first record
                    days.push({date:date_label, groups:[{groupLabel:group_label,sessions:[]}]})
                } else if(days[days.length-1].date!==date_label){
                    days.push({date:date_label, groups:[{groupLabel:group_label,sessions:[]}]})
                }

                let last_day=days.length-1
                let last_group=days[last_day].groups.length-1

                //add the group if needed
                if(days[last_day].groups[last_group].groupLabel!==group_label){
                    days[days.length-1].groups.push({groupLabel:group_label,sessions:[]})
                    last_group++
                }
                const presentation = get_exhibition(air_data, one_item)
                presentation.timeStart=get_time(block.time_block)
                presentation.timeEnd=get_time(block.time_block, presentation.timeEnd)
                //console.log("presentation", JSON.stringify(presentation))
                presentation.id=id++
                days[days.length-1].groups[last_group].sessions.push(presentation)
            }
        }
    }
    for(const day of days){
        data.push(day)
    }

    console.log("days",days)
     return data
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
    if (hour>11){ampm="pm"}
    if (hour>12){hour=hour-12}
    return hour + ":" +
           ("0" + (the_date.getMinutes()).toString()).slice(-2) + " " + ampm
}


function get_speakerGroups(air_data){// copies person data from airtable to app_data format
    const data=[]  
    let group = {speakers:[]}
    let id=1
    for(record of air_data.Person.records){
      const person=copy_attributes(record.fields, ['kind','name', 'about', 'oneLiner','email','phone','portrayedBy'])  
      person.id = id++
      person.image = get_image(record.fields,'image')
      person.icon = get_image(record.fields,'icon')
      get_people(air_data,person.portrayedBy)

      if(!(!group.kind || group.kind===person.kind)){
        // we have switched to a differnt group
        data.push(group)
        group = {speakers:[]}
      }
      group.kind = person.kind
      group.speakers.push(person)
    
    }
    data.push(group)
    return data
}


function get_exhibition(air_data, id){// returns the data for one exhibition in the format needed for the schedule, does not include info about start or end times
    for(const record of air_data.Exhibition.records){
        if(record.id === id){
            return fill_exhibition(air_data, record)
        }
    }
}

function fill_exhibition(air_data, record){
    const exhibition=copy_attributes(record.fields, ['name','oneLiner','description', 'album'])
    if(record.fields.People){
        exhibition.speakerNames=JSON.parse(JSON.stringify(record.fields.People))
    }
    if(record.fields.interests){
        exhibition.tracks=JSON.parse(JSON.stringify(record.fields.interests))
    }else{
        exhibition.tracks=[]
    }
    if(record.fields.location){
        exhibition.location=get_location(air_data, record.fields.location[0])
    }
    if(record.fields.duration){
        exhibition.timeEnd=record.fields.duration
    }
    exhibition.image=get_image(record.fields,'image')
    const icon = get_image(record.fields,'icon')
    if(icon){exhibition.icon=icon}
    get_people(air_data,exhibition.speakerNames)
    fill_interests(air_data,exhibition.tracks)
    return exhibition
}

function get_location(air_data, id){
    for(const loc of air_data.Location.records){
        if (loc.id === id){
            return loc.fields.name
        }
    }
}

function get_person_name(air_data, id){
    for(const person of air_data.Person.records){
        if (person.id === id){
            return person.fields.name
        }
    }
}


function get_track_name(air_data, id){
    for(const track of air_data.Interest.records){
        if (track.id === id){
            return track.fields.name
        }
    }
}

function get_map(air_data){// copies map data from airtable to app_data format
    const data=[]  
    for(record of air_data.Location.records){
      data.push(copy_attributes(record.fields, ['name', 'lat', 'lng', 'center']))
    }
    return data
}

function get_intro(air_data){// copies intro data from airtable to app_data format
    const data=[]  
    for(record of air_data.Introduction.records){
      const temp=  copy_attributes(record.fields, ['title', 'text', 'alignment', 'appButton'])
      temp.image = get_image(record.fields,"image")
      if(!temp.appButton){
        temp.appButton=false
      }
      data.push(temp)
    }
    return data
}
  


function get_interests(air_data){// copies interest data from airtable to app_data format
  const data={}  
  for(record of air_data.Interest.records){
    const one_record = copy_attributes(record.fields, ['name', 'backColor', 'fontColor','weight'])
    data[one_record.name]=one_record
  }
  return data
}

  
function get_event(air_data){
    // takes in the airtable data, first-level child name, and record number, and attribute list, returns an object with the values for the attributes specifeid
    const data = copy_attributes(air_data["Event"].records[0].fields,  ['name', 'dates','about','oneLiner','url','location','fbsocial','gsocial','tsocial','contactUs','emailForm','donateLink','donateText','listIn App','organizers'])
    data.image=get_image(air_data["Event"].records[0].fields, "image")
    data.donateImage=get_image(air_data["Event"].records[0].fields, "donateImage")
    data.listImage=get_image(air_data["Event"].records[0].fields, "listImage")
    get_people(air_data, data.organizers)
    return data
}

function get_people(air_data, people){
    if(people){
        for(let x=0;x<people.length;x++){
            people[x]=get_person_name(air_data, people[x])
        }
      }    
}

function fill_interests(air_data, tracks){
    if(tracks){
        for(let x=0;x<tracks.length;x++){
            tracks[x]=get_track_name(air_data, tracks[x])
        }
      }    
}


function copy_attributes(obj,  attr_list){
  // takes an object and atrribute list and reruns a new object with only the attrs specfied.  childname is use for error message
  const data={}
  for(const attr of attr_list){
    let temp=get_field(obj, attr)
    if (temp){data[attr] = temp}
  }
  return data
}

function get_field(obj, attr){
    //takes an object and an attributes, retruns the attributes's value.  childname is used for error message
    if(Object.keys(obj).includes(attr)){
        return obj[attr]
    }

}

function get_image(obj, attr){
    //returns the url for an image attribute
    if(Object.keys(obj).includes(attr)){
        return obj[attr][0].url
    }

}


function get_one_air_table(table, air_data, view){
    // gets the specifed table from air table.  calls build_festival_data when all requests are back
    air_data.requests++
    get_data(table, view).then(data=>{
        air_data.responses++
        air_data[table]=data
        build_festival_data(air_data)
    })

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


async function attest(){
    get_data("Exhibition")
};


async function attest2(){

    const url="https://api.airtable.com/v0/appZRSGHWvqF0aljB/Exhibition"
       const airtable_fetch = await axios.get(
         url ,
         { headers: { 'Content-Type': 'application/x-www-form-urlencoded',  Authorization: 'Bearer keybjicCPz1uh4l6C'}}
       )
       console.log(airtable_fetch.data.records)


}

function show_from(){
    document.getElementById("output").innerHTML =   `
<div style="margin:2rem">
    <form>
        <h1>Franklin Event Guide Publisher</h1>
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
                <td colspan=2><input type="submit" name="c" value="Preview"/><br><br></td>
            </tr>
            <tr>
                <td><a target="_blank" href="https://github.com/settings/tokens">Github token</a></td>
                <td><input name="t" type="text" size="30" value="${param('t')}"/></td>
            </tr>
            <tr>
                <td colspan=2><input type="submit" name="c" value="Publish"/></td>
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
        case "Preview":
            convert("Preview")
            break
        case "Publish":
            convert("Publish")
            break
        default:
            show_from()
    }
}