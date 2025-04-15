import https from "https"
import fs from "fs/promises"
import path from "path"

function get(url: string) {
    return new Promise<string>((resolve, reject) => {
        https.get(url, (res) => {

            let output = ''
            res.on('data', (chunk) => {
                output += chunk;
            });
            res.on("error", reject)
            res.on("end", () => {
                resolve(output)            })
        })
    })
}

function getEvents(classes: any, className: string, currentEvents?: string[]): string[] {
    let events: string[] = currentEvents || []
    for (const classs of classes) {
        if (classs.Name === className) {
            for (const member of classs.Members) {
                if (member.MemberType === "Event") {
                    events.push(member.Name)
                }
            }

            if (!!classs.Superclass) {
                events = getEvents(classes, classs.Superclass, events)
            }
        }
    }
    return events
}

async function main() {
    const latest = JSON.parse(await get('https://raw.githubusercontent.com/RobloxAPI/build-archive/master/data/production/latest.json'))
    const latestGuid = latest.GUID

    const build = JSON.parse(await get(`https://raw.githubusercontent.com/RobloxAPI/build-archive/master/data/production/builds/${latestGuid}/API-Dump.json`))
    
    let events: {[key: string]: string[]} = {}
    let classes: {[key: string]: string[]} = {}
    
    for (const classs of (build.Classes as Array<any>)) {
        const members = classs.Members
        events[classs.Name.toLowerCase()] = getEvents(build.Classes, classs.Name)

        classes[classs.Name.toLowerCase()] = classs.Name
    }

    let eventDefFile = "interface Module {\n"
    for (const [className, eventNames] of Object.entries(events)) {
        eventDefFile += `    ${className}: [${eventNames.map((name) => `"${name}"`).join(", ")}];\n`
    }
    eventDefFile += "}\n\ndeclare const Module: Module;\n\nexport = Module;"

    let classDefFile = "interface Module {\n"
    for (const [className, className2] of Object.entries(classes)) {
        classDefFile += `    ${className}: "${className2}";\n`
    }
    classDefFile += "}\n\ndeclare const Module: Module;\n\nexport = Module;"
    
    fs.writeFile(path.join(__dirname, "..", "..", "src", "events.json"), JSON.stringify(events))
    fs.writeFile(path.join(__dirname, "..", "..", "src", "events.d.ts"), eventDefFile)
    fs.writeFile(path.join(__dirname, "..", "..", "src", "classes.json"), JSON.stringify(classes))
    fs.writeFile(path.join(__dirname, "..", "..", "src", "classes.d.ts"), classDefFile)
}

main()