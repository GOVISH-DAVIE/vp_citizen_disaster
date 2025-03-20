// const passport = require('passport')
// import { prisma } from "../app";


// var JwtStrategy = require('passport-jwt').Strategy,
//     ExtractJwt = require('passport-jwt').ExtractJwt;
// let opts:any = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret'; 

// // console.log('====================================');
// // console.log(ExtractJwt.fromAuthHeaderAsBearerToken(),'bearer');
// // console.log('====================================');
 


// passport.use(new JwtStrategy(opts,
//      async function (jwt_payload, done)  { 
//       console.log('jwt_payload', jwt_payload);
//     let user =   await prisma.user.findFirst({
//         where:{
//           id:jwt_payload.id
//         }
//       })
        
//           if(user){ 
//             return done(null, user);

//           }else{

//             return done('invalid', false);
//           }
 
// }));