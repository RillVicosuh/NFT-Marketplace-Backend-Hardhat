const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

//We got the api key and api secret from creating an api key on the pinata.cloud website
//Then we copied the key and secret into the .env file for easy use
const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
//In order to work with pinata, create a connection, we need to use the key and secret.
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

//In our case, the parameter that we pass in will be like ./images/random
async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("Uploading To IPFS!!!")
    for (fileIndex in files) {
        //The images are essentially bytes of data. So we need to make a stream of all that data to make it readable 
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            //After creating the stream of data we can know upload the images to IPFS using the pinFileToIPFS function
            //By uploading to IPFS we are essentially pinning the image data to a single node on IPFS
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            //We get the responses from each image that is uploaded and put them in an array
            responses.push(response)
        }
        catch (error) {
            console.log(error)
        }
        return { responses, files }
    }
}

//This function is called after creating the metadata variable in the delpoy script
async function storeTokenUriMetadata(metadata) {
    try {
        //Uploading the metadat using the function given to us by pinata
        const response = await pinata.pinJSONToIPFS(metadata)
        //Returning the response given by uploading the metadata for the certain image
        return response
    }
    catch (error) {
        console.log(error)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }