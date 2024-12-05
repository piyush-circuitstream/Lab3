const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')
const { parse } = require('csv-parse')
const fs = require('fs')

function loadData(path) {
    const data = []

    return new Promise(function (resolve, reject) {

        fs.createReadStream(path)
            .pipe(parse({ delimiter: ',' }))
            .on('data', (r) => {
                data.push(r)
            })
            .on('end', () => {``
                resolve(data)
            })
            .on('error', () => {
                reject()
            })
    })
}

async function run() {

    const people = await loadData('./people.csv')

    db.serialize(() => {
        db.run("CREATE TABLE people (userId TEXT, firstName TEXT, lastName TEXT, sex TEXT, email TEXT, phone TEXT, dateOfBirth DATE, jobTitle TEXT)")

        for (let i = 1; i < people.length; i++) {
            const statement = db.prepare("INSERT INTO people VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            statement.run(people[i][1], people[i][2], people[i][3], people[i][4], people[i][5], people[i][6], people[i][7], people[i][8])
            statement.finalize()
        }

        db.each("SELECT * FROM people", (err, row) => {

            if (err) {
                console.error(err)
            }
            
            console.log(row)
        })
    })

    db.close()

}

run()
