import { OAuth2Client, OAuth2Token } from '@badgateway/oauth2-client'

// Create OAuth2 client
const { CLIENT_ID, CLIENT_SECRET } = process.env
if (!(CLIENT_ID && CLIENT_SECRET)) {
    console.error('Missing API credentials')
    process.exit()
}

export const client = new OAuth2Client({
    server: 'https://ext-api.vasttrafik.se/pr/v4/',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    tokenEndpoint: '/token',
})

export var token: OAuth2Token | null = null
export async function authorizedFetch(url: string, options?: RequestInit) {
    if (!token || !token.expiresAt || token.expiresAt <= currentUnixTimestamp()) {
        token = await client.clientCredentials()
    }
    // Initialize headers
    if (!options) {
        options = {}
    }
    if (!options.headers) {
        options.headers = {}
    }
    // Set Authorization header
    if (options.headers instanceof Headers) {
        options.headers.set('Authorization', `Bearer ${token.accessToken}`)
    } else {
        ;(options.headers as Record<string, string>)['Authorization'] = `Bearer ${token.accessToken}`
    }
    return fetch(url, options)
}

export function currentUnixTimestamp(): number {
    return new Date().getTime()
}
