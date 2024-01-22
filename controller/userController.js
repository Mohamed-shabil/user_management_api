const asyncHandler = require("express-async-handler");
const AppError = require("../utils/appError");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const multer = require("multer");
const { promisify } = require("util");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image !, Please upload only Images", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserProfile = upload.single("profile");

exports.resizeUserProfile = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  req.body.profile = req.file.filename;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/profile/${req.file.filename}`);
  next();
});

exports.home = (req, res) => {
  console.log(req.user);
  res.status(200).json({
    status: "success",
    data: req.user,
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    withCredentials: true,
  };
  user.password = undefined;
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    data: user,
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError("passwords are not matching", 400));
  }
  const userExist = await User.findOne({ email: req.body.email });
  console.log(userExist);
  if (userExist) {
    return next(new AppError("user already exist with this email", 400));
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
  });
  createSendToken(newUser, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return next(
      new AppError("please provide email and password to login!", 400)
    );
  }
  const user = await User.findOne({ email: email }).select("+password");
  console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect username or password", 401));
  }
  req.user = user;
  console.log("im working still here!");
  createSendToken(user, 200, res);
});

exports.editAccount = asyncHandler(async (req, res, next) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  if (req.body.profile) {
    data.profile = req.body.profile;
  }
  const updatedData = await User.findOneAndUpdate({ _id: req.user.id }, data);
  res.status(200).json({
    status: "success",
    data: updatedData,
  });
});
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // token = req.header.autherization.split(' ')[1]
    token = req.headers.authorization.split(" ")[1];
    console.log("token ", token);
  } else if (req.cookies.jwt) {
    console.log(req.cookies);
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in ! Please Login to get Access", 401)
    );
  }
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode);
  const currentUser = await User.findById(decode.id);
  console.log("curentZUser", currentUser);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token is does no longer exist.",
        404
      )
    );
  }
  req.user = currentUser;
  console.log(req.user);
  next();
});

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 10000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
});
