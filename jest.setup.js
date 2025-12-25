import '@testing-library/jest-dom'

// Polyfills required by @solana/web3.js in Jest/jsdom
import { TextDecoder, TextEncoder } from 'util'

global.TextEncoder = TextEncoder
// @ts-expect-error - jsdom global type differs
global.TextDecoder = TextDecoder
