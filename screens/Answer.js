import React,{useState,useReducer,useEffect} from 'react';
import { Entypo } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, Text, View,TouchableOpacity,ActivityIndicator } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import reducer, {TEXT_CHANGE,LIST_CHANGE} from "../components/reducer";
import { TextInput as PaperTextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

import * as Layout from '../constants/Layout';
import * as api from '../services/question';
import * as apiTag from '../services/tag';

export default function AnswerScreen(props) {
    const [error, setError] = useState(null);
    const [haveChange, setHaveChange] = useState(false);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [tags,setTags] = useState([]);
    const fields = [
        {name: 'name',label:"Name", placeholder: 'Name', value:"",required: true},
        {name: 'answer',label:"Reponse", placeholder: 'Reponse', value:"",required: false},
        {name: 'tag',label:"Tag", placeholder: 'Tag', value:null,required: false},
    ];
    const onSubmit = async () => {
        if (stateEncaiss[0].value.length === 0) {
            setError("Le champs name doit être remplit")
            return;
        } else if (answers.length === 0){
            setError("Vous devez ajouter des réponses")
            return;
        }
        setLoading(true);
        try {
            let newAnswer = [];
            for (var i = 0; i < answers.length; i++) {
                newAnswer.push({tag:answers[i].tag._id,answer:answers[i].answer})
            }
            let data = {question:stateEncaiss[0].value,answers:newAnswer};
            let response = await api.newQuestion(data);
            setAnswers([]);
            for (var i = 0; i < stateEncaiss.length; i++) {
                if (stateEncaiss[i].name === "tag") {
                    changeList(stateEncaiss[i].name,null);    
                } else {
                    changeText(stateEncaiss[i].name,"");
                }
            }
            alert("Question crée");
            setLoading(false);
            setError(null);
        } catch(e){
            setError(e.message);
            setLoading(false);
        }
    }
    const [stateEncaiss, dispatch] = useReducer(reducer, fields);
    const changeText = (name,text) => {
        if(!haveChange) setHaveChange(true);
        dispatch({type: TEXT_CHANGE, name, text});
    };

    const changeList = (name,data) => {
        if(!haveChange) setHaveChange(true);
        dispatch({type: LIST_CHANGE, name, data});
    };

    const onAdd = () => {
        if (stateEncaiss[1].value.length > 0 && stateEncaiss[2].value) {
            answers.push({answer:stateEncaiss[1].value,tag:stateEncaiss[2].value});
            setAnswers([...answers]);
            changeList("tag",null);
            changeText("answer","");
            setError(null);
        } else {
            setError("Les deux champs doivent être remplit");
        }
    }

    const getAllTags = async () => {
        try {
            let response = await apiTag.getTags();
            let tags = response.tags;
            let select = []
            for (var i = 0; i < tags.length; i++) {
                select.push({value:tags[i]._id,label:tags[i].name})
            }
            setTags(select);
        } catch(e) {
            setError(e.message);
        }
    }

    const onRemove = (key) => {
        let temp = [...answers];

        temp.splice(key, 1);

        setAnswers(temp);
    }

    const onValueChange = (value,id) => {
        changeList("tag",{_id:tags[id-1].value,name:tags[id-1].label})
    }

    useEffect(() => {

        props.navigation.addListener('focus', () => {
            getAllTags();
        });
      
        return () => {
            props.navigation.removeListener('focus');
        };
    }, [props.navigation]);
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text>Questions</Text>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            {stateEncaiss.map((field,key) => {
                if (field.name === 'tag') {
                    return (
                        <View key={key} style={{marginTop:10}}>
                            <RNPickerSelect
                                key={key}
                                useNativeAndroidPickerStyle={false}
                                style={pickerSelectStyles}
                                onValueChange={onValueChange}
                                items={tags}
                            />
                        </View>
                    );
                } else {
                    return (
                        <PaperTextInput
                            key={key}
                            mode={"outlined"}
                            label={field.label}
                            placeholder={field.placeholder}
                            secureTextEntry={field.secure}
                            value={field.value}
                            onChangeText={(text) => changeText(field.name,text)}
                            required={field.required}
                            style={{backgroundColor: "#fff",marginTop:10}}
                        />
                    );
                }
            })}
            <TouchableOpacity style={{ justifyContent: "center", marginTop: 20, marginLeft: 0 }} onPress={() => onAdd()}>
                <LinearGradient start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} colors={["#0093FF", "#00DEFF"]} style={styles.buttonAdd} >
                    <Text style={styles.buttonSubmit}>Ajouter</Text>
                </LinearGradient>
            </TouchableOpacity>
            {answers.map((answer,key)=> {
                return (
                    <View style={styles.item} key={key}>
                        <Text>Réponse : {answer.answer}</Text>
                        <Text>Tag : {answer.tag.name}</Text>
                        <TouchableOpacity onPress={() => onRemove(key)}>
                            <Entypo name="circle-with-cross" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                );
            })}
            <TouchableOpacity disabled={!haveChange} style={{ justifyContent: "center", marginTop: 20, marginLeft: 0,opacity:(haveChange)?1:0.3 }} onPress={() => onSubmit()}>
                <LinearGradient start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} colors={["#0093FF", "#00DEFF"]} style={styles.button} >
                    {loading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ):(
                        <Text style={styles.buttonSubmit}>VALIDER</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    contentContainer: {
        flex: 1,
        marginLeft:20,
        marginRight:20,
        marginTop:40
    },
    errorText: {
        color:"#E6265C",
        fontSize:15
    },
    item:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"space-between",
        marginTop:10
    },
    button : {
        alignItems: 'center', 
        borderRadius: 15, 
        width: '100%', 
        paddingTop: 13, 
        paddingBottom: 13,
        paddingLeft:Layout.width*0.07,
        paddingRight:Layout.width*0.07
    },
    buttonAdd : {
        alignItems: 'center', 
        borderRadius: 15, 
        width: '50%', 
        paddingTop: 13, 
        paddingBottom: 13,
        paddingLeft:Layout.width*0.07,
        paddingRight:Layout.width*0.07
    },
    buttonSubmit:{
        color:"#fff",
        fontWeight:'700'
    },
    select: {

    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
    },
});