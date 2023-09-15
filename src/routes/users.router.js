const express = require("express");
const usersRouter = express.Router();
const passport = require("passport");
const User = require("../models/users.model");
const sendMail = require("../mail/mail");

usersRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({ msg: info });
    }
    // req.logIn 을 호출해서 세션을 생성하기 위해 user 파라미터는
    // serializerUser 의 파라미터로 들어감
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      // 로긴성공하면 리다이렉트
      res.redirect("/posts");
    });
  })(req, res, next);
});

usersRouter.post("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

usersRouter.post("/signup", async (req, res) => {
  // user 객체 생성
  const user = new User(req.body);
  try {
    // user 컬렉션에 유저 저장
    // 저장하기 전에 모델파일의 userShema.pre 를 실행
    await user.save();
    // 여기에서 이메일을 보냄
    // '받는사람이메일', '받는사람이름', 'welcome'
    sendMail("bdh323@naver.com", "doo", "welcome");

    res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
});

usersRouter.get("/google", passport.authenticate("google"));
usersRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/posts",
    failureRedirect: "/login",
  })
);

usersRouter.get("/kakao", passport.authenticate("kakao"));
usersRouter.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successReturnToOrRedirect: "/posts",
    failureRedirect: "/login",
  })
);

module.exports = usersRouter;
