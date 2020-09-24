/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
} from 'react-native';
import {
    Button,
    Card,
    TextInput,
    Title,
    Paragraph,
    Provider as PaperProvider
} from 'react-native-paper';
import auth from '@react-native-firebase/auth';

const App: () => React$Node = () => {
    const [mail, setMail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [user, setUser] = React.useState();

    React.useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    function onAuthStateChanged(user) {
        console.log(user);
        setUser(user);
    }

    function onLogin() {
        auth()
            .createUserWithEmailAndPassword(mail, password)
            .then(() => {
                console.log('User account created & signed in!');
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    console.log('That email address is already in use!');
                }
                if (error.code === 'auth/invalid-email') {
                    console.log('That email address is invalid!');
                }
                console.log(error);
            });
    }

    function onLogout() {
        auth()
            .signOut()
            .then(() => console.log('User signed out!'));
    }

    // render
    let content;
    if (!user) {
        // no logged in user
        content = (
            <Card>
                <Card.Content>
                    <Title>Login</Title>
                    <Paragraph>Please login in our application</Paragraph>
                    <TextInput
                        style={styles.mTop8}
                        label="Email"
                        value={mail}
                        mode="outlined"
                        onChangeText={mail => setMail(mail)}
                    />
                    <TextInput
                        style={styles.mTop8}
                        label="Password"
                        secureTextEntry
                        value={password}
                        mode="outlined"
                        onChangeText={password => setPassword(password)}
                    />
                    <Button
                        style={[styles.mTop8, styles.loginButton]}
                        icon="login"
                        mode="contained"
                        onPress={onLogin}>
                        Login
                    </Button>
                </Card.Content>
            </Card>
        );
    } else {
        // logged in user
        content = (
            <Card>
                <Card.Content>
                    <Title>User</Title>
                    <Paragraph>You have a registered user</Paragraph>
                    <Paragraph>
                        {
                            JSON.stringify(user)
                        }
                    </Paragraph>
                    <Button
                        style={[styles.mTop8, styles.loginButton]}
                        icon="logout"
                        mode="contained"
                        onPress={onLogout}>
                        Logout
                    </Button>
                </Card.Content>
            </Card>
        )
    }
    return (

        <PaperProvider>
            <StatusBar barStyle="dark-content"/>
            <View style={styles.mainView}>
                {
                    content
                }
            </View>
        </PaperProvider>
    )
};

const styles = StyleSheet.create({
    mainView: {
        padding: 15,
        alignItems: 'stretch',
        justifyContent: 'center',
        flex: 1,
    },
    mTop8: {
        marginTop: 8
    },
    loginButton: {
        padding: 8,
    }
});

export default App;
