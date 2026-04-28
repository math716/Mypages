import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createS3Client, getBucketConfig } from "./aws-config"

const s3Client = createS3Client()

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic: boolean = true
): Promise<{ uploadUrl: string; cloud_storage_path: string }> {
  const { bucketName, folderPrefix } = getBucketConfig()
  
  const cloud_storage_path = isPublic
    ? `${folderPrefix}public/uploads/${Date.now()}-${fileName}`
    : `${folderPrefix}uploads/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
    ContentDisposition: isPublic ? "attachment" : undefined,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  return { uploadUrl, cloud_storage_path }
}

export async function getFileUrl(
  cloud_storage_path: string,
  isPublic: boolean = true
): Promise<string> {
  const { bucketName } = getBucketConfig()
  const region = process.env.AWS_REGION || "us-east-1"

  if (isPublic) {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ResponseContentDisposition: "attachment",
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

