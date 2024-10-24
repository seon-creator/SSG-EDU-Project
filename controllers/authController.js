const User = require('../schema/User'); // 유저 스키마 불러오기
const bcrypt = require('bcryptjs');     // 패스워드 해시화
const jwt = require('jsonwebtoken');    // 토큰

// 로그인 기능 메서드
exports.login = async (req, res) => {
    const { userid, password } = req.body;   // 요청 body 에서 이메일, 비밀번호를 추출함
  
    try {
        // 입력받은 id로 데이터베이스에 해당 이메일이 있는지 확인
        let user = await User.findOne({ userid });
        if (!user) {    // 유저가 존재하지 않으면 에러 메시지를 반환
            return res.status(200).json({ msg: '회원 정보가 등록되어있지 않습니다.', isSuccess: false });
        }
        
        // 비밀번호가 일치하는지 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: '패스워드가 틀립니다.', isSuccess: false });
        }
  
        // JWT 페이로드를 생성
        const payload = {
            user: {
                id: user.id
            }
        };
        // JWT를 생성하여 클라이언트에 반환함
        jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,  // JWT 시크릿 키를 사용
            { expiresIn: '4h' },    // 토큰의 유효시간을 2시간으로 설정
            (err, token) => {
                if (err) throw err;
                res.json({ token, user, isSuccess: true });    // 토큰을 클라이언트에 반환
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
  };

// 회원가입 기능을 담당하는 함수
exports.signup = async (req, res) => {
  const { userid, password, name } = req.body;  // 요청 body 에서 이메일, 비밀번호, 사용자이름을 추출함
  try {
      let user = await User.findOne({ userid: userid });   // 기존 유저가 있는지 확인
      if (user) { // 유저가 이미 존재하면 에러 메시지를 반환함
          return res.status(409).json({ msg: '해당 계정이 이미 존재합니다.'});
      }

      // 새로운 이메일 주소인 경우 새 유저 객체를 생성함
      user = new User({ 
          userid: userid,
          password: password, 
          name: name
      });

      const salt = await bcrypt.genSalt(10);  // salt 값을 생성
      user.password = await bcrypt.hash(password, salt);  // 비밀번호를 해싱함
      await user.save();  // 유저 정보를 데이터베이스에 저장

      // 회원가입 성공 시 완료 메시지를 반환
      res.status(200).json({ msg: '회원가입이 완료되었습니다.' });
  } catch (err) {
      res.status(500).send({ msg: '서버 에러가 발생했습니다.' });
  }
};

// ID 중복 확인 메서드
exports.checkUserID = async (req, res) => {
    const { userID } = req.body;
    try {
      // MongoDB에서 동일한 id가 있는 유저 조회
      const existingUser = await User.findOne({ userid: userID });
  
      if (existingUser) {
        // 중복된 경우
        return res.status(200).json({ isAvailable: false, message: '중복된 아이디입니다.' });
      }
  
      // 중복되지 않은 경우
      res.status(200).json({ isAvailable: true, message: '사용 가능한 아이디입니다.' });
    } catch (error) {
      console.error('중복 검사 중 오류 발생:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  };