const addToVisionBoard =
  "INSERT INTO vision_board (uid,img_link) VALUES(1,$1), (1, $2),(1, $3)";
const addToCommitmentTable =
  "INSERT INTO commitment (uid,amount,duration) VALUES (1,$1,$2) ON CONFLICT(uid) Do UPDATE SET amount = excluded.amount, duration=excluded.duration RETURNING *";

const getVisionBoard = "SELECT * FROM vision_board";
const getCommitment = "SELECT * FROM commitment";

module.exports = {
  addToVisionBoard,
  addToCommitmentTable,
  getVisionBoard,
  getCommitment,
};
