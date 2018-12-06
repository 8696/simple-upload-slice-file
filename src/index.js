import './polyfill';
import UploadFile from './upload';

if (!window.FormData) {
    throw new Error('FormData is not defined ; tips : Please use IE10 or more or other mainstream browsers');
}
window.SimpleUploadSliceFile = UploadFile;



