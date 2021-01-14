import React from 'react'
import { View, Text, Image, Button, ImageBackground, TouchableOpacity, StyleSheet} from 'react-native'
import {launchCamera, launchImageLibrary} from 'react-native-image-picker'
import logo from './kaynaklar/logo.png'
import arkaplan from './kaynaklar/arkaplan.jpg'

export default class App extends React.Component {

  //sahneler menu, islem, cikti
  //menu - resimlerin secildigi ekran
  //islem - apiden cevap gelene kadar gösterilen ekran
  //cikti - islenmisFotografin gosterildigi ekran
  state = {
    sahne: 'menu',
    islenmisFotograf : null,
  }

  //Resim ayarlari
  //Kamera ve Dosyadan Seçme Fonksiyonları bu ayarlari ortak olarak kullanıyor.
  //Full Hd'den büyük çözünürlükler sıkıştırılıyor.
  //ImagePicker componenti bu obje ile ayarlamalarini yapiyor
  options = {
    mediaType: 'photo', //Sadece fotoğraf seçilsin
    maxWidth: 900, // max genişlik fazlaysa resim sıkıştırılsın
    maxHeight: 1600, //max yükseklik fazlaysa resim sıkıştırılsın
    quality: 1, // Kalite bozulmasın max 1
  };

  //Image-Pickerın Kullanımında 
  //https://github.com/react-native-image-picker/react-native-image-picker
  //referans alınmıştır ve faydalanılmıştır.
  kameradanResimCek = async() => {

      //ImagePicker componentinin launchCamera metoduyla kamerayı açıyoruz
      launchCamera(this.options, (response) => {
        if (response.didCancel) {
          //Kullanıcı seçimi iptal ederse fonksiyondan çık
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          //Kameraya ulaşılamazsa fonksiyondan çık
          return;
        } else if (response.errorCode == 'permission') {
          //İzinlerle ilgili problem var ise fonksiyondan çık
          return;
        } else if (response.errorCode == 'others') {
          //Başka bir hata var ise fonksiyondan çık
          return;
        }

        //Komponentten Dönen response objesini apiye yolluyoruz.
        this.resimGonder(response);
      });
  }

  galeridenResimSec = async() => {

      //ImagePicker componentinin launchImageLibrary metoduyla galeriyi açıyoruz
      launchImageLibrary(this.options, (response) => {

        if (response.didCancel) {
          //Kullanıcı seçimi iptal ederse fonksiyondan çık
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          //Kameraya ulaşılamazsa fonksiyondan çık
          return;
        } else if (response.errorCode == 'permission') {
          //İzinlerle ilgili problem var ise fonksiyondan çık
          return;
        } else if (response.errorCode == 'others') {
          //Başka bir hata var ise fonksiyondan çık
          return;
        }

        //Komponentten Dönen response objesini apiye yolluyoruz.
        this.resimGonder(response);
      });
  }

  //Google Cloud - Compute Engine Api Adresi
  api = "api_adresi:port";

  resimGonder = (fotograf) => {
    //İslem yapiliyor bekleme ekrani
    this.setState({islenmisFotograf : null, sahne : 'islem'})

    //Apiye post atıyoruz. Resmi Form Data tipinde.
    fetch(this.api + "/upload", {
      method: "POST",
      body: this.formDataOlustur(fotograf)
    })
      .then(response => response.json())
      .then(response => {
        console.log("Resim Gönderildi.", response); //DEBUG
        //State'i ayarliyoruz cikti ekrani için
        this.setState({ islenmisFotograf : response , sahne : 'cikti'})
      })
      .catch(error => {
        //Eğer bir hata olursa gönderemezsek
      
          console.log("Resim Gönderilirken bir problem oluştu.", error); //DEBUG 
          alert("Could Not Connect To API!");
          this.setState({islenmisFotograf : null, sahne : 'menu'})
        
        
      });

      
  };

  //form-data biçiminde post atacağız
  //form-data ile resim göndermek için 3 parametre kesin lazım
  //url, isim, tip
  formDataOlustur = (fotograf) => {
    const veri = new FormData();
  
    veri.append("photo", {
      name: fotograf.fileName,
      type: fotograf.type,
      uri:
        Platform.OS === "android" ? fotograf.uri : fotograf.uri.replace("file://", "") // ios
    });
  
    return veri;
  };




  //Arayüz Elemanları
  render() {
    //Sahne bilgisinin alınması
    const { islenmisFotograf , sahne} = this.state
    return (
      
      //Ana pencere diğer komponentleri de barındırıyor
      <View style={styles.pencere}>
        
        <ImageBackground source={arkaplan} style={styles.arkaplan}>

        {sahne == 'menu' 
        &&
          <Image source = {logo} style = {styles.logo}></Image>
        }

        {sahne == 'menu' 
        &&
          <Text style = {styles.baslik} >Cloud Based Object Detection</Text>
        }

        {sahne == 'menu' 
        &&
          <Text style = {styles.aciklama} >Select Or Take A Photo For Detecting Objects</Text>
        }

        {sahne == 'islem'
          &&
          <Text style = {styles.beklemeYazi} >Detection Continues. Please Wait... </Text>
        }
        
        {sahne == 'menu'
          &&
          <TouchableOpacity 
          onPress={this.kameradanResimCek}
          style = {styles.buton1}>
          <Text style = {styles.buton1Yazi}>Take A Photo</Text>
          </TouchableOpacity>
        }

        {sahne == 'menu'
          &&
          <TouchableOpacity 
          onPress={this.galeridenResimSec}
          style = {styles.buton2}>
          <Text style = {styles.buton2Yazi}>Select A Photo</Text>
          </TouchableOpacity>
        }
        
        {(sahne == 'cikti' && islenmisFotograf != null) && (
          <Text style = {styles.aciklama2}>Showing Results. Image Load time depending on its size.</Text>
        )}

        {(sahne == 'cikti'  && islenmisFotograf != null) && (
          <Image
            source={{ uri: this.api + islenmisFotograf.url }}
            style={styles.fotograf}
          />
        )}

        
        {(sahne == 'cikti' && islenmisFotograf != null) && (
          <Text style = {styles.aciklama2}>{islenmisFotograf.count} objects found.</Text>
        )}

        
        {(sahne == 'cikti' && islenmisFotograf != null) && (
          <Text style = {styles.aciklama2}>Object List: {islenmisFotograf.list}</Text>
        )}

        {sahne == 'cikti' && (
            <TouchableOpacity 
             onPress={() => {this.setState({ islenmisFotograf : null , sahne : 'menu'})}  }
             style = {styles.buton2}>
             <Text style = {styles.buton2Yazi}>Return To Menu</Text>
           </TouchableOpacity>
        )}

        
     

        </ImageBackground>
      </View>


    );//Render İçinde Return
  }//Render Sonu


}//App sonu

const styles = StyleSheet.create({
  pencere:{
    flex: 1,
    flexDirection: "column",
  },
  baslik:{
    color: 'pink',
    fontSize: 20,
    marginBottom: 5,
  },
  logo:{
    width: 300,
    height : 300,
    marginBottom: 10,
  },
  aciklama:{
    color: 'pink',
    fontSize: 14,
    marginBottom: 20,
  },
  aciklama2:{
    color: 'pink',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  beklemeYazi:{
    color: 'pink',
    fontSize: 20,
  },
  buton1:{
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buton2:{
    backgroundColor : 'pink',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buton1Yazi:{
    color : 'pink',
    fontSize : 12,
  },
  buton2Yazi:{
    color : 'purple',
    fontSize: 12,
  },
  fotograf:{
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  arkaplan:{
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: 'center',
  }
});