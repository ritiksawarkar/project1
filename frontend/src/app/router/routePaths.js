export const routePaths = {
  home: "/",
  login: "/login",
  register: "/register",
  missions: "/missions",
  assignments: "/assignments",
  missionCreate: "/missions/create",
  missionDetailPattern: "/missions/:id",
  missionDetail: (id) => `/missions/${id}`,
  proofSubmit: "/proofs/submit",
  proofSubmitForMission: (id) => `/proofs/submit?missionId=${id}`,
  proofReview: "/proofs/review",
  admin: "/admin",
};
