import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from 'aws-sdk';


const BUCKET_NAME = "nuber-eats-daniela";

@Controller("uploads")
export class UploadsController {
    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file){

        AWS.config.update({
            credentials: {
                accessKeyId: 'AKIA3MCCONMZRDR64COB',
                secretAccessKey: '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'
            }
        });

        try {
      
            const objectName = `${Date.now()+file.originalname}`;

            const upload = await new AWS.S3()
            .putObject({
                Body: file.buffer,
                Bucket: BUCKET_NAME,
                Key: objectName,
                ACL: 'public-read'
            })
            .promise();

            const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
            return {url: fileUrl};
       
            
        } catch(e){
           console.log(e);
           return null;
        }

        console.log(file);
        
    }
}