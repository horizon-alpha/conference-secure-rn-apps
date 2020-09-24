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
    Portal,
    Provider as PaperProvider
} from 'react-native-paper';


const App: () => React$Node = () => {
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');


    return (
        <PaperProvider>
            <StatusBar barStyle="dark-content"/>
            <View style={styles.mainView}>
                <Card>
                    <Card.Content>
                        <Title>Login</Title>
                        <Paragraph>Please login in our application</Paragraph>
                        <TextInput
                            style={styles.mTop8}
                            label="Email"
                            value={name}
                            mode="outlined"
                            onChangeText={name => setName(name)}
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
                            onPress={() => alert(name + "\n" + password)}>
                            Login
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </PaperProvider>
    );
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
