export function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(ms), ms)
    })
}

export function formatSeconds(seconds: number) {
    return new Date(seconds * 1000).toISOString().slice(11, 19)
}
