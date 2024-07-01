import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useState} from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { WindowSharp } from '@mui/icons-material';

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
  const [dataType, setDataType] = useState("company");
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
        if(res.data==='succes'){
          console.log('Data uploaded successfully');
          setExcelData(null);
          setExcelFile(null);
          setFile(null);
          window.alert('Data uploaded successfully');
        }
      }).catch(e => {console.log(e); })
    
    // catch (e) {
    //   console.log(e);
    // }
  }
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-2xl">
      <h3 className="text-3xl font-bold text-center mb-8 text-indigo-800">SheetDB</h3>
  
      <form className="mb-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4" onSubmit={handleFileSubmit}>
        <input 
          type="file" 
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-slate-500 text-sm"
          required 
          onChange={handleFile} 
        />
        <button 
          type="submit" 
          className="py-2 px-6 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-200"
        >
          UPLOAD
        </button>
      </form>
      
      {typeError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{typeError}</p>
        </div>
      )}
  
      <div className="data-type-selector flex justify-center space-x-6 mb-8">
        <label className="inline-flex items-center">
          <input 
            type="radio" 
            className="form-radio text-indigo-600" 
            name="dataType" 
            value="company" 
            onChange={handleDataTypeChange} 
            checked
          />
          <span className="ml-2 text-indigo-800">Company</span>
        </label>
        <label className="inline-flex items-center">
          <input 
            type="radio" 
            className="form-radio text-indigo-600" 
            name="dataType" 
            value="contact" 
            onChange={handleDataTypeChange} 
          />
          <span className="ml-2 text-indigo-800">Contact</span>
        </label>
      </div>
  
      <div className="viewer bg-white rounded-lg shadow-lg p-6 overflow-hidden">
        {excelData ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {excelData.map((individualExcelData, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {Object.keys(individualExcelData).map((key) => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {individualExcelData[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No File is uploaded yet!</div>
        )}
      </div>
  
      {excelData && (
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={pushtodb}
            className="py-2 px-6 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75 transition-colors duration-200"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              setExcelData(null);
              setExcelFile(null);
            }}
            className="py-2 px-6 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-75 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
