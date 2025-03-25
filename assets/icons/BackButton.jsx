import React from "react";
import {View,Text} from 'react-native'
import ArrowIcon from '../../assets/icons/arrow'
import CustomIcon from '../../assets/icons/CustomIcon'
import {wp,hp} from '../../src/helpers/common'

const BackButton =({
    direction
})=>{
    return (
        <View style={{borderWidth:3,borderColor:'orange',backgroundColor:'white',width:wp(17),height:hp(8),borderRadius:50,alignItems:'center',justifyContent:'center'}} >
        {direction=="right" ? <ArrowIcon/> : <CustomIcon/> }
        </View>
    )
}
export default BackButton