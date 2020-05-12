import aws from "aws-sdk";
import { IFileStorage } from "../interfaces/IFileStorage";
import { ISignedUrl } from "../interfaces/ISignedUrl";
import { OK, ERR } from "@/api/IResponse";

const AWSvars = [
  process.env.MY_AWS_ACCESS_BUCKET,
  process.env.MY_AWS_ACCESS_REGION,
  process.env.MY_AWS_ACCESS_KEY_ID,
  process.env.MY_AWS_SECRET_KEY,
];

class S3FileStorage implements IFileStorage {
  private s3: aws.S3;
  private bucket: string;

  constructor() {
    if (AWSvars.includes(undefined)) {
      throw Error(
        `a process.env.AWS was not set: ${AWSvars.map((v) => Boolean(v))}`
      );
    }
    this.bucket = process.env.MY_AWS_ACCESS_BUCKET!;
    aws.config.update({
      region: process.env.MY_AWS_ACCESS_REGION,
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.MY_AWS_SECRET_KEY,
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
      ACL: "public-read",
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
        uploadUrl: data,
      });
    } catch (error) {
      console.error(error);
      return ERR<ISignedUrl>("Signed url could not be retrieved");
    }
  };
}

const s3FileStorage = new S3FileStorage();
export default s3FileStorage;
