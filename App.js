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
    FlatList,
    StyleSheet,
    StatusBar,
} from 'react-native';
import {
    Button,
    Card,
    TextInput,
    Title,
    Paragraph,
    Switch,
    List,
    Provider as PaperProvider
} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import * as Keychain from 'react-native-keychain';
import firestore from '@react-native-firebase/firestore';

const App: () => React$Node = () => {
    const [mail, setMail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [activeTodo, setActiveTodo] = React.useState('');
    const [todos, setTodos] = React.useState([]);
    const [user, setUser] = React.useState();
    const [storeUserCredentials, setStoreUserCredentials] = React.useState(false);
    const [hasStoredCredentials, setHasStoredCredentials] = React.useState(false);

    let todoSubscription;

    React.useEffect(() => {
        checkForCredentials();
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    async function checkForCredentials() {
        try {
            // Retrieve the credentials
            const hasStoredCredentials = await Keychain.hasInternetCredentials('horizon.conf.firebase');
            setHasStoredCredentials(hasStoredCredentials);
        } catch (error) {
            setHasStoredCredentials(false);
        }
    }

    function onAuthStateChanged(user) {
        console.log(user);
        setUser(user);
        if(user){
            todoSubscription = firestore()
                .collection("Todos")
                .doc(user.uid)
                .collection("Todos")
                .orderBy("timestamp", "asc")
                .onSnapshot(onTodosChance, onTodosChangeError);
        }
    }

    function onTodosChance(querySnapshot) {
        const todos = [];
        querySnapshot.forEach(documentSnapshot => {
            todos.push(documentSnapshot.data());
        });
        setTodos(todos);
    }

    function onTodosChangeError(error) {
        console.log(error);
    }

    function onLogin(loginMail: string, loginPassword: string, loginStoreUserCredentials: boolean) {
        auth()
            .signInWithEmailAndPassword(loginMail, loginPassword)
            .then(async () => {
                if(loginStoreUserCredentials){
                    // store user credentials
                    await Keychain.setInternetCredentials(
                        'horizon.conf.firebase',
                        loginMail,
                        loginPassword,
                        {
                            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
                            accessControl: Keychain.ACCESS_CONTROL.USER_PRESENCE
                        });
                    console.log('stored user credentials');
                } else {
                    await Keychain.resetInternetCredentials('horizon.conf.firebase');
                    console.log('removed user credentials');
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    async function onLoginWithStoredCredentials() {
        try {
            // Retrieve the credentials
            const credentials = await Keychain.getInternetCredentials('horizon.conf.firebase');
            console.log(credentials);
            if (credentials) {
                onLogin(credentials.username, credentials.password, true);
            }
        } catch (error) {
            console.log("Keychain couldn't be accessed!", error);
        }


    }

    function onLogout() {

        if(todoSubscription){
            todoSubscription();
            todoSubscription = undefined;
        }
        auth()
            .signOut()
            .then(() => {
                setActiveTodo("");
                setTodos([]);
                checkForCredentials();
            });
    }

    function onStoreUserCredentialsChange() {
        setStoreUserCredentials(!storeUserCredentials);
    }

    function onAddTodo() {
        if(activeTodo === ""){
            alert("Please add some text")
        } else {
            firestore().collection("Todos").doc(user.uid).collection("Todos")
                .add({
                    text: activeTodo,
                    timestamp: Date.now()
                })
                .then((docId) => {
                    console.log("Successfully stored document: ", docId);
                })
                .catch((error) => {
                    console.log("Could not store document: ", error);
                })
        }
    }

    // render rows for todos
    function renderRow({item}) {
        return (
            <List.Item title={item.text}/>
        );
    }

    // render
    let loginWithStoredCredentials;
    if(hasStoredCredentials){
        loginWithStoredCredentials = (
            <Button
                style={[styles.mTop8, styles.loginButton]}
                icon="login"
                mode="contained"
                onPress={onLoginWithStoredCredentials}>
                Login with stored credentials
            </Button>
        )
    }
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
                    <View style={styles.line}>
                        <Switch
                            value={storeUserCredentials}
                            onValueChange={onStoreUserCredentialsChange}/>
                            <Paragraph>Store user credentials</Paragraph>
                    </View>
                    <Button
                        style={[styles.mTop8, styles.loginButton]}
                        icon="login"
                        mode="contained"
                        onPress={() => onLogin(mail, password, storeUserCredentials)}>
                        Login
                    </Button>
                    {
                        loginWithStoredCredentials
                    }
                </Card.Content>
            </Card>
        );
    } else {
        // logged in user
        content = (
            <Card>
                <Card.Content>
                    <Title>Todos</Title>
                    <Paragraph>Here are your Todos:</Paragraph>
                    <FlatList
                        data={todos}
                        renderItem={renderRow}
                        keyExtractor={(item, index) => "key" + index}
                    />
                    <TextInput
                        style={styles.mTop8}
                        label="Todo"
                        value={activeTodo}
                        mode="outlined"
                        onChangeText={activeTodo => setActiveTodo(activeTodo)}
                    />
                    <Button
                        style={[styles.mTop8, styles.loginButton]}
                        icon="logout"
                        mode="contained"
                        onPress={onAddTodo}>
                        Add
                    </Button>
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
    },
    line: {
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: 8,
    }
});

export default App;
