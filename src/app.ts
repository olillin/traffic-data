import fs from 'fs'
import { authorizedFetch, currentUnixTimestamp } from './client'
import { generateZones } from './zones'
import { sleep, formatSeconds } from './util'
import { Position, PositionsResponseEntry } from './types'

// Configuration

/** Path for the file to output to */
const outputFilePath: string = process.env.OUT_PATH ?? './data.csv'
/** How many minutes the app should collect data for */
const lifetimeMinutes: number = process.env.LIFETIME_MINUTES ? parseFloat(process.env.LIFETIME_MINUTES) : 24 * 60
/** How many seconds the app should wait between polling the next zone */
const frequencySeconds: number = process.env.FREQUENCY_SECONDS ? parseFloat(process.env.FREQUENCY_SECONDS) : 5

// Create output file
if (fs.existsSync(outputFilePath)) {
    console.error('Output file already exists, stopping execution')
    process.exit()
}
const out = fs.createWriteStream(outputFilePath)
// Write CSV header
out.write('timestamp,zone,line,direction,transportMode,latitude,longitude')

// Generate zones
const zones = generateZones(8)

// Main loop
function main(): Promise<number> {
    return new Promise(async resolve => {
        var positionCount = 0
        var currentZoneId = 0
        while (process.uptime() < lifetimeMinutes * 60) {
            await getPositions(currentZoneId)
                .then(async data => {
                    var count = 0
                    data.forEach(line => {
                        out.write('\n')
                        out.write(line.map(value => value.toString().replace(/,/g, '","')).join(','))
                        count++
                    })

                    console.log(`Gathered ${count} positions from zone ${currentZoneId}, current time: ${formatSeconds(process.uptime())}`)
                    positionCount += count

                    // Next zone
                    currentZoneId++
                    if (currentZoneId >= zones.length) {
                        currentZoneId = 0
                    }
                })
                .catch(reason => {
                    console.warn(reason)
                })

            await sleep(frequencySeconds * 1000)
        }
        resolve(positionCount)
    })
}

function getPositions(zoneId: number): Promise<Position[]> {
    const zone = zones[zoneId]
    return new Promise((resolve, reject) => {
        const url = `https://ext-api.vasttrafik.se/pr/v4/positions?lowerLeftLat=${zone[0]}&lowerLeftLong=${zone[1]}&upperRightLat=${zone[2]}&upperRightLong=${zone[3]}&limit=200`
        authorizedFetch(url)
            .then(async response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    let message = `Failed to get positions, code ${response.status}`
                    if (response.bodyUsed) {
                        message += `\nResponse body: ${await response.text()}`
                    }
                    return Promise.reject(message)
                }
            })
            .then(json => {
                const now = currentUnixTimestamp()
                const positions: Position[] = (json as PositionsResponseEntry[]).map(entry => {
                    var transportMode = entry.line.transportMode
                    if (entry.line.transportSubMode && entry.line.transportSubMode !== 'none') {
                        transportMode += '/' + entry.line.transportSubMode
                    }
                    return [
                        now, // timestamp
                        zoneId, // zone
                        entry.line.name, // line
                        entry.directionDetails.fullDirection, // direction
                        transportMode, // transportMode
                        entry.latitude, // latitude
                        entry.longitude, // longitude
                    ]
                })
                resolve(positions)
            })
            .catch(reason => reject(reason))
    })
}

main().then(positionCount => {
    out.end(() => {
        console.log(`Finished in ${Math.round(process.uptime())}s`)
        console.log(`Total vehicles: ${positionCount}`)
    })
})
