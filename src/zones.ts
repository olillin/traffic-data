/**
 * Bounds have the form: [lowerLeftLat, lowerLeftLong, upperRightLat, upperRightLong]
 */
export const bounds = [56.1496278, 10.2134046, 60.670150574324886, 17.148177023103646]

export function generateZones(gridSize: number) {
    const boundsHeight = Math.abs(bounds[2] - bounds[0])
    const boundsWidth = Math.abs(bounds[3] - bounds[1])
    const gridPartitionLatitude = boundsHeight / gridSize
    const gridPartitionLongitude = boundsWidth / gridSize

    const zones = []
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            zones.push([
                bounds[0] + gridPartitionLatitude * i, //
                bounds[1] + gridPartitionLongitude * j,
                bounds[0] + gridPartitionLatitude * (i + 1),
                bounds[1] + gridPartitionLongitude * (j + 1),
            ])
        }
    }
    return zones
}
