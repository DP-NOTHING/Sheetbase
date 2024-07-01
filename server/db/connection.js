import mongoose from 'mongoose';
import multer from 'multer';
export const connect = async () => {
	return await mongoose.connect(process.env.CONNECTIONSTRING, {
		// useNewUrlParser: true,
		// useUnifiedTopology: true,
		// useNewUrlParser: true,
		// useUnifiedTopology: true,
		// useMongoClient: true,
	});
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './sheets')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() 
      cb(null, uniqueSuffix+file.originalname)
    }
  })
export const upload=multer({ storage: storage })


// exports.connect = connect;
// module.exports.connect = connect;