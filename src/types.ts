// timestamp,zone,line,direction,transportMode,latitude,longitude
export type Position = [number, number, string, string, string, number, number]

export interface PositionsResponseEntry {
    detailsReference: string
    line: {
        name: string
        backgroundColor: string
        foregroundColor: string
        borderColor: string
        transportMode: string
        transportSubMode: string
    }
    notes: [
        {
            type: string
            severity: any
            text: string
        }
    ]
    name: string
    direction: string
    directionDetails: {
        fullDirection: string
        shortDirection: string
        replaces: string
        via: string
        isFreeService: true
        isPaidService: true
        isSwimmingService: true
        isDirectDestinationBus: true
        isFrontEntry: true
        isExtraBus: true
        isExtraBoat: true
        isExtraTram: true
    }
    latitude: number
    longitude: number
}
