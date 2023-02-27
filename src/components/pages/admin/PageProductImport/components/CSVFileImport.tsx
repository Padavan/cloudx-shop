import React from "react";
import Typography from "@mui/material/Typography";
import CircularProgress  from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

const defaultHeaders = {
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
};

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 5MB

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | null>();
  const [inProgress, setInProgress] = React.useState(false);
  const [error, setError] = React.useState<unknown | null>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    if (!file) {
      return;
    }

    console.log("uploadFile to", url);

    try {
      setInProgress(true);
      // Get the presigned URL
      const response = await axios({
        url,
        params: {
          name: file.name,
        },
      });
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);
      const s3url:string = response.data;
      const result = await fetch(s3url, {
        method: "PUT",
        // headers: defaultHeaders,
        body: file,
      });
      console.log("Result: ", result);
      setFile(null);

    } catch (err) {
      console.log("Error", err);
      setError(err);
    } finally {
      setInProgress(false)
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} accept=".csv" size={MAX_FILE_SIZE} multiple={false} />
      ) : (
        <div>
          <span>{file.name}</span>
          {inProgress && <CircularProgress />}
          <Button variant="contained" onClick={removeFile} size="small" disabled={inProgress} startIcon={<DeleteIcon />}>Remove file</Button>
          <Button variant="contained" onClick={uploadFile} size="small" disabled={inProgress} endIcon={<SendIcon />}>Upload file</Button>
        </div>
      )}
    </Box>
  );
}
