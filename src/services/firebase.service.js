// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { createUniqueName } from "./uploadFiles.service.js";
import { envConfig } from "../config/config.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAa0Ai0u7rEZr2ul0ifR586ObWtW-d6IT8",
	authDomain: "nodejs-stationery.firebaseapp.com",
	projectId: "nodejs-stationery",
	storageBucket: "nodejs-stationery.appspot.com",
	messagingSenderId: "389964895832",
	appId: "1:389964895832:web:49ff0cab010661f1c11c2d",
	measurementId: "G-5PJ6S1QGKD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // del
// add
isSupported().then((ok) => {
	ok && getAnalytics(app); // no need
});
// end add
const storage = getStorage();

/**
 *
 * @param {Express.Multer.File} file
 * @returns
 */
export const singleUpload = async (file) => {
	const storageRef = ref(
		storage,
		envConfig.firebaseImageStorage + createUniqueName(file.fieldname + "_" + file.originalname),
	);
	// Create file metadata including the content type
	const metadata = {
		contentType: file.mimetype,
	};
	// Upload the file in the bucket storage
	const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
	//by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
	// Grab the public url
	const downloadURL = await getDownloadURL(snapshot.ref);
	return downloadURL;
};
/**
 *
 * @param {String} downloadURL
 */
export const singleDelete = async (downloadURL) => {
	try {
		const httpsReference = ref(storage, downloadURL);
		const filePath = httpsReference.fullPath;
		const desertRef = ref(storage, filePath);
		await deleteObject(desertRef);
	} catch (error) {
		console.log("singleDelete", error);
		if (error?.code === "storage/object-not-found") {
			console.log("singleDelete, file is not exist!");
		}
	}
};

/**
 *
 * @param {String[]} downloadURLs
 */
export const firebaseDelete = async (downloadURLs) => {
	const deletePromises = downloadURLs.map((downloadURL) => singleDelete(downloadURL));
	try {
		await Promise.all(deletePromises);
	} catch (error) {
		return Promise.reject(error);
	}
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
export const firebaseUpload = async (req, res) => {
	const images = req.files;
	const imagesURL = [];
	const uploadPromises = images.map((image) => singleUpload(image));
	try {
		const uploadedUrls = await Promise.all(uploadPromises);
		imagesURL.push(...uploadedUrls);
		return imagesURL;
	} catch (error) {
		return Promise.reject(error);
	}
};
