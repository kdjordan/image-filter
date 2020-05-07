import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {validateURL, filterImageFromURL, deleteLocalFiles} from './util/util';
const urlExist = require("url-exist");
const path = require('path');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  app.get( "/filteredimage", async ( req: Request, res: Response ) => {
    console.log(req.query)
      let { url } = req.query

      // 1. validate the image_url query
      // 1a. check util function by to see if we have a properly constructed URL 
      if(!url) {
        return res.status(400).send({ message: 'File url is required' });
      }
      if(validateURL(url)){
        return res.status(400).send({ message: 'File url is malformed' });
      }
      // 1b. check to see if the URL is functioning as expected using npm package: https://www.npmjs.com/package/url-exist
      // if not - return mssg
      const exists = await urlExist(url);
      if (!exists) {
        return res.status(404).send({ message: 'Image is not available' });
      }
      
      // 2. call filterImageFromURL(image_url) to filter the image
      // 2a. check to see if our filterImage was successfull
      let file = await filterImageFromURL(url)
      if(!file) {
        return res.status(400).send({ message: 'Trouble Filtering your Image' });
      }
      // 3. send the resulting file in the response
      // 3a. add callBack function to delete files after image is sent
      res.status(200).sendFile(file, (err) => {
        if (err) {
          console.log(err)
        } else {
          //4. deletes any files on the server on finish of the response
          deleteLocalFiles([file])
        }
      })
  } );

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
    // res.sendFile('index.html', { root: path.join(__dirname, './public') });
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();