// Adapted from installed T3 Code chrome: black canvas, charcoal surfaces,
// near-white light canvas. Actions and study stages follow the requested monochrome palette.
export const T3_THEMES = [
  {
    id:'t3-light',name:'White',mode:'light',isDefault:true,pairsWith:'t3-dark',family:'Neutral',
    canvas:'#FAFAFA',sunken:'#F4F4F4',base:'#FFFFFF',raised:'#FFFFFF',border:'#E4E4E4',
    text:'#181818',text2:'#666666',accent:'#181818',onAccent:'#FFFFFF',mark:'#181818',
    focus:'#181818',recall:'#363636',rest:'#545454',overtime:'#767676',
    illu:{line:'#181818',wash:'#F4F4F4',highlight:'#363636'},
    nav:{bg:'#FAFAFA',active:'#E4E4E4'},chart:{shift:0,chroma:0}
  },
  {
    id:'t3-dark',name:'Black & White',mode:'dark',isDefault:true,pairsWith:'t3-light',family:'Neutral',
    canvas:'#000000',sunken:'#0A0A0A',base:'#111111',raised:'#1E1E1E',border:'#292929',
    text:'#F5F5F5',text2:'#A3A3A3',accent:'#E5E5E5',onAccent:'#111111',mark:'#E5E5E5',
    focus:'#E7E7E7',recall:'#BDBDBD',rest:'#989898',overtime:'#787878',
    illu:{line:'#E5E5E5',wash:'#1E1E1E',highlight:'#E5E5E5'},
    nav:{bg:'#000000',active:'#1C1C1C'},chart:{shift:0,chroma:0}
  }
]
