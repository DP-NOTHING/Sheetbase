import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useState} from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Form() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null); 
  const [excelData, setExcelData] = useState(null);
  const [dataType, setDataType] = useState('company');
  const [file, setFile] = useState(null);
  const handleDataTypeChange = (event) => {
    setDataType(event.target.value);
  };
  const handleFile=(e)=>{
    let fileTypes = ['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv'];
    let selectedFile = e.target.files[0];
    if(selectedFile){
      setFile(selectedFile);
      if(selectedFile&&fileTypes.includes(selectedFile.type)){
        setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload=(e)=>{
          setExcelFile(e.target.result);
        }
      }
      else{
        setTypeError('Please select only excel file types');
        setExcelFile(null);
      }
    }
    else{
      console.log('Please select your file');
    }
  }
  
  const handleFileSubmit=(e)=>{
    e.preventDefault();
    if(excelFile!==null){
      const workbook = XLSX.read(excelFile,{type: 'buffer'});
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(data.slice(0,10));
    }
  }
  const pushtodb=async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    console.log("hello" + file);
    
      await axios.post(`${process.env.REACT_APP_BACKEND}/upload-files-${dataType}`, formData).then(res => {
        console.log(res);
      }).catch(e => {console.log(e); })
    
    // catch (e) {
    //   console.log(e);
    // }
  }
  return (
    <div className="wrapper">

      <h3>Upload & View Excel Sheets</h3>

      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        <input type="file" className="form-control" required onChange={handleFile} />
        <button type="submit" className="btn btn-success btn-md">UPLOAD</button>
        {typeError&&(
          <div className="alert alert-danger" role="alert">{typeError}</div>
        )}
      </form>

      <div className="data-type-selector">
  <div className="form-check form-check-inline">
    <input className="form-check-input" type="radio" name="dataType" id="company" value="company" onChange={handleDataTypeChange} checked/>
    <label className="form-check-label" for="company">Company</label>
  </div>
  <div className="form-check form-check-inline">
    <input className="form-check-input" type="radio" name="dataType" id="contact" value="contact" onChange={handleDataTypeChange} />
    <label className="form-check-label" for="contact">Contact</label>
  </div>
</div>

      <div className="viewer">
        {excelData?(
          <div className="table-responsive">
            <table className="table">

              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key)=>(
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {console.log(excelData)}
                {excelData.map((individualExcelData, index)=>(
                  <tr key={index}>
                    {Object.keys(individualExcelData).map((key)=>(
                      <td key={key}>{individualExcelData[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>

            </table>


                <Button onClick={pushtodb}>Confirm</Button>
                <Button onClick={()=>{
                  setExcelData(null);
                  setExcelFile(null);
                }}>Cancel</Button>

          </div>



        ):(
          <div>No File is uploaded yet!</div>
        )}
      </div>

    </div>
  );
}
