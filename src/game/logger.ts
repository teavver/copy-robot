import ENV from "../environment";

export const logger = (msg: string, minLogMode: number = 2) => {
    if (ENV.LOG < minLogMode) return
    minLogMode === 0 ? console.error(msg) : console.log(msg)
}