import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogle = () => {
  GoogleSignin.configure({
    webClientId:
      "610741862614-fibdqn41gl9khnscui02nipupbhq1d70.apps.googleusercontent.com",
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};
