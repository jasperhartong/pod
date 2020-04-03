import aws from "aws-sdk";
import { IFileStorage } from "../interfaces/IFileStorage";
import { ISignedUrl } from "../interfaces/ISignedUrl";
import { OK, ERR } from "../../IResponse";

const AWSvars = [
  process.env.AWS_ACCESS_BUCKET,
  process.env.AWS_ACCESS_REGION,
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_KEY
];

class S3FileStorage implements IFileStorage {
  private s3: aws.S3;
  private bucket: string;

  constructor() {
    if (AWSvars.includes(undefined)) {
      throw Error(`a process.env.AWS not set not set: ${AWSvars}`);
    }
    this.bucket = process.env.AWS_ACCESS_BUCKET!;
    aws.config.update({
      region: process.env.AWS_ACCESS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY
    });
    this.s3 = new aws.S3();
  }

  getSignedUrl = async (fileName: string, fileType: string) => {
    // Set up the payload of what we are sending to the S3 api
    const s3Params = {
      Bucket: this.bucket,
      Key: fileName,
      Expires: 500,
      ContentType: fileType,
      ACL: "public-read"
    };
    try {
      const data: string = await new Promise((resolve, reject) => {
        this.s3.getSignedUrl("putObject", s3Params, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
      return OK<ISignedUrl>({
        downloadUrl: `https://${this.bucket}.s3.amazonaws.com/${fileName}`,
        uploadUrl: data
      });
    } catch (error) {
      console.error(error);
      return ERR<ISignedUrl>("Signed url could not be retrieved");
    }
  };
}

const s3FileStorage = new S3FileStorage();
export default s3FileStorage;
