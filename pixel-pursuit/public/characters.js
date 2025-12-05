// Character data with SVG sprites for different states
const characterData = {
  Alex: {
    description: "A friendly character with a blue shirt and yellow head.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#FFD700"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="10" width="4" height="2" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#00BFFF"/>
                        <!-- Right Arm -->
                        <rect x="6" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#000080"/>
                        <rect x="17" y="26" width="3" height="6" fill="#000080"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#FFD700"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="11" width="4" height="1" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#00BFFF"/>
                        <!-- Right Arm -->
                        <rect x="6" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#000080"/>
                        <rect x="17" y="26" width="3" height="6" fill="#000080"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#FFD700"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="10" width="4" height="2" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#00BFFF"/>
                        <!-- Left Arm -->
                        <rect x="22" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#000080"/>
                        <rect x="17" y="26" width="3" height="6" fill="#000080"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#FFD700"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="11" width="4" height="1" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#00BFFF"/>
                        <!-- Left Arm -->
                        <rect x="22" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#000080"/>
                        <rect x="17" y="26" width="3" height="6" fill="#000080"/>
                    </svg>`,
    },
  },
  Bella: {
    description: "A cheerful character with a green head and pink dress.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#32CD32"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="10" width="4" height="2" fill="#FF1493"/>
                        <!-- Dress Body -->
                        <rect x="8" y="14" width="16" height="12" fill="#FF69B4"/>
                        <!-- Right Arm -->
                        <rect x="6" y="16" width="2" height="6" fill="#32CD32"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#FFB6C1"/>
                        <rect x="17" y="26" width="3" height="6" fill="#FFB6C1"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#32CD32"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="11" width="4" height="1" fill="#FF1493"/>
                        <!-- Dress Body -->
                        <rect x="8" y="14" width="16" height="12" fill="#FF69B4"/>
                        <!-- Right Arm -->
                        <rect x="6" y="16" width="2" height="6" fill="#32CD32"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#FFB6C1"/>
                        <rect x="17" y="26" width="3" height="6" fill="#FFB6C1"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#32CD32"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="10" width="4" height="2" fill="#FF1493"/>
                        <!-- Dress Body -->
                        <rect x="8" y="14" width="16" height="12" fill="#FF69B4"/>
                        <!-- Left Arm -->
                        <rect x="24" y="16" width="2" height="6" fill="#32CD32"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#FFB6C1"/>
                        <rect x="17" y="26" width="3" height="6" fill="#FFB6C1"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#32CD32"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="11" width="4" height="1" fill="#FF1493"/>
                        <!-- Dress Body -->
                        <rect x="8" y="14" width="16" height="12" fill="#FF69B4"/>
                        <!-- Left Arm -->
                        <rect x="24" y="16" width="2" height="6" fill="#32CD32"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#FFB6C1"/>
                        <rect x="17" y="26" width="3" height="6" fill="#FFB6C1"/>
                    </svg>`,
    },
  },
  Charlie: {
    description: "A strong character with red hair and orange shirt.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#8B4513"/>
                        <!-- Hair -->
                        <rect x="8" y="0" width="16" height="4" fill="#DC143C"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="10" width="4" height="2" fill="#FFFFFF"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#FF8C00"/>
                        <!-- Right Arm -->
                        <rect x="6" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#8B4513"/>
                        <rect x="17" y="26" width="3" height="6" fill="#8B4513"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#8B4513"/>
                        <!-- Hair -->
                        <rect x="8" y="0" width="16" height="4" fill="#DC143C"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="11" width="4" height="1" fill="#FFFFFF"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#FF8C00"/>
                        <!-- Right Arm -->
                        <rect x="6" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#8B4513"/>
                        <rect x="17" y="26" width="3" height="6" fill="#8B4513"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#8B4513"/>
                        <!-- Hair -->
                        <rect x="8" y="0" width="16" height="4" fill="#DC143C"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="10" width="4" height="2" fill="#FFFFFF"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#FF8C00"/>
                        <!-- Left Arm -->
                        <rect x="22" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#8B4513"/>
                        <rect x="17" y="26" width="3" height="6" fill="#8B4513"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="2" width="12" height="12" fill="#8B4513"/>
                        <!-- Hair -->
                        <rect x="8" y="0" width="16" height="4" fill="#DC143C"/>
                        <!-- Eyes -->
                        <rect x="13" y="6" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="6" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="11" width="4" height="1" fill="#FFFFFF"/>
                        <!-- Body -->
                        <rect x="10" y="14" width="12" height="12" fill="#FF8C00"/>
                        <!-- Left Arm -->
                        <rect x="22" y="16" width="4" height="8" fill="#8B4513"/>
                        <!-- Legs -->
                        <rect x="12" y="26" width="3" height="6" fill="#8B4513"/>
                        <rect x="17" y="26" width="3" height="6" fill="#8B4513"/>
                    </svg>`,
    },
  },
  Daisy: {
    description: "A mysterious wizard character with a purple robe and hat.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Wizard Hat -->
                        <rect x="12" y="0" width="8" height="12" fill="#4B0082"/>
                        <rect x="10" y="10" width="12" height="2" fill="#4B0082"/>
                        <!-- Head -->
                        <rect x="10" y="12" width="12" height="8" fill="#FFDBAC"/>
                        <!-- Eyes -->
                        <rect x="13" y="15" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="15" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="18" width="4" height="1" fill="#8B0000"/>
                        <!-- Robe Body -->
                        <rect x="6" y="20" width="20" height="12" fill="#8A2BE2"/>
                        <!-- Magic Staff (right hand) -->
                        <rect x="2" y="14" width="2" height="12" fill="#8B4513"/>
                        <rect x="1" y="14" width="4" height="2" fill="#FFD700"/>
                        <!-- No visible legs (covered by robe) -->
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Wizard Hat -->
                        <rect x="12" y="0" width="8" height="12" fill="#4B0082"/>
                        <rect x="10" y="10" width="12" height="2" fill="#4B0082"/>
                        <!-- Head -->
                        <rect x="10" y="12" width="12" height="8" fill="#FFDBAC"/>
                        <!-- Eyes -->
                        <rect x="13" y="15" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="15" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="19" width="4" height="1" fill="#8B0000"/>
                        <!-- Robe Body -->
                        <rect x="6" y="20" width="20" height="12" fill="#8A2BE2"/>
                        <!-- Magic Staff (right hand) -->
                        <rect x="2" y="14" width="2" height="12" fill="#8B4513"/>
                        <rect x="1" y="14" width="4" height="2" fill="#FFD700"/>
                        <!-- No visible legs (covered by robe) -->
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Wizard Hat -->
                        <rect x="12" y="0" width="8" height="12" fill="#4B0082"/>
                        <rect x="10" y="10" width="12" height="2" fill="#4B0082"/>
                        <!-- Head -->
                        <rect x="10" y="12" width="12" height="8" fill="#FFDBAC"/>
                        <!-- Eyes -->
                        <rect x="13" y="15" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="15" width="2" height="2" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="14" y="18" width="4" height="1" fill="#8B0000"/>
                        <!-- Robe Body -->
                        <rect x="6" y="20" width="20" height="12" fill="#8A2BE2"/>
                        <!-- Magic Staff (left hand) -->
                        <rect x="28" y="14" width="2" height="12" fill="#8B4513"/>
                        <rect x="27" y="14" width="4" height="2" fill="#FFD700"/>
                        <!-- No visible legs (covered by robe) -->
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Wizard Hat -->
                        <rect x="12" y="0" width="8" height="12" fill="#4B0082"/>
                        <rect x="10" y="10" width="12" height="2" fill="#4B0082"/>
                        <!-- Head -->
                        <rect x="10" y="12" width="12" height="8" fill="#FFDBAC"/>
                        <!-- Eyes -->
                        <rect x="13" y="15" width="2" height="2" fill="#000000"/>
                        <rect x="17" y="15" width="2" height="2" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="14" y="19" width="4" height="1" fill="#8B0000"/>
                        <!-- Robe Body -->
                        <rect x="6" y="20" width="20" height="12" fill="#8A2BE2"/>
                        <!-- Magic Staff (left hand) -->
                        <rect x="28" y="14" width="2" height="12" fill="#8B4513"/>
                        <rect x="27" y="14" width="4" height="2" fill="#FFD700"/>
                        <!-- No visible legs (covered by robe) -->
                    </svg>`,
    },
  },
  Zoe: {
    description:
      "A blocky robot character with metallic colors and simple LED eyes.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="9" fill="#B0BEC5"/>
                        <!-- Eyes -->
                        <rect x="12" y="3" width="3" height="3" fill="#00FF00"/>
                        <rect x="18" y="3" width="3" height="3" fill="#00FF00"/>
                        <!-- Happy Mouth (LED smile) -->
                        <rect x="15" y="6" width="3" height="3" fill="#00FF00"/>
                        <!-- Body -->
                        <rect x="10" y="9" width="12" height="15" fill="#78909C"/>
                        <!-- Arm -->
                        <rect x="6" y="12" width="4" height="3" fill="#546E7A"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#455A64"/>
                        <rect x="19" y="24" width="3" height="8" fill="#455A64"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="9" fill="#B0BEC5"/>
                        <!-- Eyes -->
                        <rect x="12" y="3" width="3" height="3" fill="#FF0000"/>
                        <rect x="18" y="3" width="3" height="3" fill="#FF0000"/>
                        <!-- Sad Mouth (LED frown) -->
                        <rect x="15" y="6" width="3" height="3" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="9" width="12" height="15" fill="#78909C"/>
                        <!-- Arm -->
                        <rect x="6" y="12" width="4" height="3" fill="#546E7A"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#455A64"/>
                        <rect x="19" y="24" width="3" height="8" fill="#455A64"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="9" fill="#B0BEC5"/>
                        <!-- Eyes -->
                        <rect x="10" y="3" width="3" height="3" fill="#00FF00"/>
                        <rect x="16" y="3" width="3" height="3" fill="#00FF00"/>
                        <!-- Happy Mouth (LED smile) -->
                        <rect x="13" y="6" width="3" height="3" fill="#00FF00"/>
                        <!-- Body -->
                        <rect x="10" y="9" width="12" height="15" fill="#78909C"/>
                        <!-- Arm -->
                        <rect x="22" y="12" width="4" height="3" fill="#546E7A"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#455A64"/>
                        <rect x="19" y="24" width="3" height="8" fill="#455A64"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="9" fill="#B0BEC5"/>
                        <!-- Eyes -->
                        <rect x="10" y="3" width="3" height="3" fill="#FF0000"/>
                        <rect x="16" y="3" width="3" height="3" fill="#FF0000"/>
                        <!-- Sad Mouth (LED frown) -->
                        <rect x="13" y="6" width="3" height="3" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="9" width="12" height="15" fill="#78909C"/>
                        <!-- Arm -->
                        <rect x="22" y="12" width="4" height="3" fill="#546E7A"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#455A64"/>
                        <rect x="19" y="24" width="3" height="8" fill="#455A64"/>
                    </svg>`,
    },
  },
  Leo: {
    description: "A valiant knight in shining armor, ready for battle.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Helmet -->
                        <rect x="10" y="0" width="12" height="12" fill="#BDBDBD"/>
                        <rect x="12" y="3" width="6" height="3" fill="#000000"/> <!-- Visor -->
                        <!-- Body (Armor) -->
                        <rect x="10" y="12" width="12" height="12" fill="#9E9E9E"/>
                        <!-- Arm (with sword) -->
                        <rect x="6" y="12" width="4" height="3" fill="#757575"/>
                        <rect x="3" y="15" width="3" height="3" fill="#757575"/>
                        <rect x="0" y="18" width="3" height="3" fill="#757575"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#616161"/>
                        <rect x="19" y="24" width="3" height="8" fill="#616161"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Helmet -->
                        <rect x="10" y="0" width="12" height="12" fill="#BDBDBD"/>
                        <rect x="12" y="3" width="6" height="3" fill="#000000"/> <!-- Visor -->
                        <!-- Body (Armor) -->
                        <rect x="10" y="12" width="12" height="12" fill="#9E9E9E"/>
                        <!-- Arm (with sword) -->
                        <rect x="6" y="12" width="4" height="3" fill="#757575"/>
                        <rect x="3" y="15" width="3" height="3" fill="#757575"/>
                        <rect x="0" y="18" width="3" height="3" fill="#757575"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#616161"/>
                        <rect x="19" y="24" width="3" height="8" fill="#616161"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Helmet -->
                        <rect x="10" y="0" width="12" height="12" fill="#BDBDBD"/>
                        <rect x="12" y="3" width="6" height="3" fill="#000000"/> <!-- Visor -->
                        <!-- Body (Armor) -->
                        <rect x="10" y="12" width="12" height="12" fill="#9E9E9E"/>
                        <!-- Arm (with sword) -->
                        <rect x="22" y="12" width="4" height="3" fill="#757575"/>
                        <rect x="26" y="15" width="3" height="3" fill="#757575"/>
                        <rect x="29" y="18" width="3" height="3" fill="#757575"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#616161"/>
                        <rect x="19" y="24" width="3" height="8" fill="#616161"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Helmet -->
                        <rect x="10" y="0" width="12" height="12" fill="#BDBDBD"/>
                        <rect x="12" y="3" width="6" height="3" fill="#000000"/> <!-- Visor -->
                        <!-- Body (Armor) -->
                        <rect x="10" y="12" width="12" height="12" fill="#9E9E9E"/>
                        <!-- Arm (with sword) -->
                        <rect x="22" y="12" width="4" height="3" fill="#757575"/>
                        <rect x="26" y="15" width="3" height="3" fill="#757575"/>
                        <rect x="29" y="18" width="3" height="3" fill="#757575"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#616161"/>
                        <rect x="19" y="24" width="3" height="8" fill="#616161"/>
                    </svg>`,
    },
  },
  Mia: {
    description: "A mystical wizard with a pointy hat and a flowing robe.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="12" y="0" width="6" height="3" fill="#673AB7"/>
                        <rect x="10" y="3" width="12" height="3" fill="#673AB7"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="12" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="15" y="12" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Robe) -->
                        <rect x="6" y="15" width="20" height="17" fill="#4A148C"/>
                        <!-- Arm (holding staff) -->
                        <rect x="3" y="18" width="3" height="3" fill="#7B1FA2"/>
                        <rect x="0" y="21" width="3" height="3" fill="#7B1FA2"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="12" y="0" width="6" height="3" fill="#673AB7"/>
                        <rect x="10" y="3" width="12" height="3" fill="#673AB7"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="12" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="15" y="15" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Robe) -->
                        <rect x="6" y="15" width="20" height="17" fill="#4A148C"/>
                        <!-- Arm (holding staff) -->
                        <rect x="3" y="18" width="3" height="3" fill="#7B1FA2"/>
                        <rect x="0" y="21" width="3" height="3" fill="#7B1FA2"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="12" y="0" width="6" height="3" fill="#673AB7"/>
                        <rect x="10" y="3" width="12" height="3" fill="#673AB7"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="10" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="13" y="12" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Robe) -->
                        <rect x="6" y="15" width="20" height="17" fill="#4A148C"/>
                        <!-- Arm (holding staff) -->
                        <rect x="26" y="18" width="3" height="3" fill="#7B1FA2"/>
                        <rect x="29" y="21" width="3" height="3" fill="#7B1FA2"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="12" y="0" width="6" height="3" fill="#673AB7"/>
                        <rect x="10" y="3" width="12" height="3" fill="#673AB7"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="10" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="13" y="15" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Robe) -->
                        <rect x="6" y="15" width="20" height="17" fill="#4A148C"/>
                        <!-- Arm (holding staff) -->
                        <rect x="26" y="18" width="3" height="3" fill="#7B1FA2"/>
                        <rect x="29" y="21" width="3" height="3" fill="#7B1FA2"/>
                    </svg>`,
    },
  },
  Noah: {
    description: "A rugged adventurer with a backpack and a wide-brimmed hat.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="6" y="0" width="20" height="3" fill="#8B4513"/>
                        <rect x="10" y="3" width="12" height="3" fill="#8B4513"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="12" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="15" y="12" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Shirt) -->
                        <rect x="10" y="12" width="12" height="9" fill="#A0522D"/>
                        <!-- Backpack -->
                        <rect x="12" y="15" width="8" height="6" fill="#5A2D1F"/>
                        <!-- Legs -->
                        <rect x="10" y="21" width="3" height="11" fill="#696969"/>
                        <rect x="19" y="21" width="3" height="11" fill="#696969"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="6" y="0" width="20" height="3" fill="#8B4513"/>
                        <rect x="10" y="3" width="12" height="3" fill="#8B4513"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="12" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="15" y="15" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Shirt) -->
                        <rect x="10" y="12" width="12" height="9" fill="#A0522D"/>
                        <!-- Backpack -->
                        <rect x="12" y="15" width="8" height="6" fill="#5A2D1F"/>
                        <!-- Legs -->
                        <rect x="10" y="21" width="3" height="11" fill="#696969"/>
                        <rect x="19" y="21" width="3" height="11" fill="#696969"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="6" y="0" width="20" height="3" fill="#8B4513"/>
                        <rect x="10" y="3" width="12" height="3" fill="#8B4513"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="10" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="13" y="12" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Shirt) -->
                        <rect x="10" y="12" width="12" height="9" fill="#A0522D"/>
                        <!-- Backpack -->
                        <rect x="12" y="15" width="8" height="6" fill="#5A2D1F"/>
                        <!-- Legs -->
                        <rect x="10" y="21" width="3" height="11" fill="#696969"/>
                        <rect x="19" y="21" width="3" height="11" fill="#696969"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hat -->
                        <rect x="6" y="0" width="20" height="3" fill="#8B4513"/>
                        <rect x="10" y="3" width="12" height="3" fill="#8B4513"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="10" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="13" y="15" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Shirt) -->
                        <rect x="10" y="12" width="12" height="9" fill="#A0522D"/>
                        <!-- Backpack -->
                        <rect x="12" y="15" width="8" height="6" fill="#5A2D1F"/>
                        <!-- Legs -->
                        <rect x="10" y="21" width="3" height="11" fill="#696969"/>
                        <rect x="19" y="21" width="3" height="11" fill="#696969"/>
                    </svg>`,
    },
  },
  Chloe: {
    description: "A quirky alien with green skin and antennae.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Antennae -->
                        <rect x="12" y="0" width="3" height="3" fill="#9CCC65"/>
                        <rect x="18" y="0" width="3" height="3" fill="#9CCC65"/>
                        <!-- Head (Larger, more alien-like) -->
                        <rect x="6" y="3" width="20" height="12" fill="#8BC34A"/>
                        <!-- Eyes (Larger) -->
                        <rect x="10" y="6" width="6" height="6" fill="#000000"/>
                        <rect x="18" y="6" width="6" height="6" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="12" y="12" width="8" height="3" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="15" width="12" height="12" fill="#689F38"/>
                        <!-- Arm -->
                        <rect x="6" y="15" width="4" height="3" fill="#33691E"/>
                        <!-- Legs -->
                        <rect x="10" y="27" width="3" height="5" fill="#4CAF50"/>
                        <rect x="19" y="27" width="3" height="5" fill="#4CAF50"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Antennae -->
                        <rect x="12" y="0" width="3" height="3" fill="#9CCC65"/>
                        <rect x="18" y="0" width="3" height="3" fill="#9CCC65"/>
                        <!-- Head (Larger, more alien-like) -->
                        <rect x="6" y="3" width="20" height="12" fill="#8BC34A"/>
                        <!-- Eyes (Larger) -->
                        <rect x="10" y="6" width="6" height="6" fill="#000000"/>
                        <rect x="18" y="6" width="6" height="6" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="12" y="15" width="8" height="3" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="15" width="12" height="12" fill="#689F38"/>
                        <!-- Arm -->
                        <rect x="6" y="15" width="4" height="3" fill="#33691E"/>
                        <!-- Legs -->
                        <rect x="10" y="27" width="3" height="5" fill="#4CAF50"/>
                        <rect x="19" y="27" width="3" height="5" fill="#4CAF50"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Antennae -->
                        <rect x="10" y="0" width="3" height="3" fill="#9CCC65"/>
                        <rect x="16" y="0" width="3" height="3" fill="#9CCC65"/>
                        <!-- Head (Larger, more alien-like) -->
                        <rect x="6" y="3" width="20" height="12" fill="#8BC34A"/>
                        <!-- Eyes (Larger) -->
                        <rect x="10" y="6" width="6" height="6" fill="#000000"/>
                        <rect x="18" y="6" width="6" height="6" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="12" y="12" width="8" height="3" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="15" width="12" height="12" fill="#689F38"/>
                        <!-- Arm -->
                        <rect x="22" y="15" width="4" height="3" fill="#33691E"/>
                        <!-- Legs -->
                        <rect x="10" y="27" width="3" height="5" fill="#4CAF50"/>
                        <rect x="19" y="27" width="3" height="5" fill="#4CAF50"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Antennae -->
                        <rect x="10" y="0" width="3" height="3" fill="#9CCC65"/>
                        <rect x="16" y="0" width="3" height="3" fill="#9CCC65"/>
                        <!-- Head (Larger, more alien-like) -->
                        <rect x="6" y="3" width="20" height="12" fill="#8BC34A"/>
                        <!-- Eyes (Larger) -->
                        <rect x="10" y="6" width="6" height="6" fill="#000000"/>
                        <rect x="18" y="6" width="6" height="6" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="12" y="15" width="8" height="3" fill="#FF0000"/>
                        <!-- Body -->
                        <rect x="10" y="15" width="12" height="12" fill="#689F38"/>
                        <!-- Arm -->
                        <rect x="22" y="15" width="4" height="3" fill="#33691E"/>
                        <!-- Legs -->
                        <rect x="10" y="27" width="3" height="5" fill="#4CAF50"/>
                        <rect x="19" y="27" width="3" height="5" fill="#4CAF50"/>
                    </svg>`,
    },
  },
  Sam: {
    description: "A spooky skeleton character with hollow eyes.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#EEEEEE"/>
                        <!-- Eyes (Hollow) -->
                        <rect x="12" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="15" y="6" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Ribcage) -->
                        <rect x="10" y="12" width="12" height="12" fill="#DEDEDE"/>
                        <!-- Arm -->
                        <rect x="6" y="12" width="4" height="3" fill="#C2C2C2"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#B0B0B0"/>
                        <rect x="19" y="24" width="3" height="8" fill="#B0B0B0"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#EEEEEE"/>
                        <!-- Eyes (Hollow) -->
                        <rect x="12" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="15" y="9" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Ribcage) -->
                        <rect x="10" y="12" width="12" height="12" fill="#DEDEDE"/>
                        <!-- Arm -->
                        <rect x="6" y="12" width="4" height="3" fill="#C2C2C2"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#B0B0B0"/>
                        <rect x="19" y="24" width="3" height="8" fill="#B0B0B0"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#EEEEEE"/>
                        <!-- Eyes (Hollow) -->
                        <rect x="10" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="13" y="6" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Ribcage) -->
                        <rect x="10" y="12" width="12" height="12" fill="#DEDEDE"/>
                        <!-- Arm -->
                        <rect x="22" y="12" width="4" height="3" fill="#C2C2C2"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#B0B0B0"/>
                        <rect x="19" y="24" width="3" height="8" fill="#B0B0B0"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#EEEEEE"/>
                        <!-- Eyes (Hollow) -->
                        <rect x="10" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="13" y="9" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Ribcage) -->
                        <rect x="10" y="12" width="12" height="12" fill="#DEDEDE"/>
                        <!-- Arm -->
                        <rect x="22" y="12" width="4" height="3" fill="#C2C2C2"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#B0B0B0"/>
                        <rect x="19" y="24" width="3" height="8" fill="#B0B0B0"/>
                    </svg>`,
    },
  },
  Finn: {
    description: "A forest ranger with a green uniform and a sturdy build.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="12" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="15" y="6" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Uniform) -->
                        <rect x="10" y="12" width="12" height="12" fill="#388E3C"/>
                        <!-- Arm -->
                        <rect x="6" y="12" width="4" height="3" fill="#1B5E20"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#4CAF50"/>
                        <rect x="19" y="24" width="3" height="8" fill="#4CAF50"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="12" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="15" y="9" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Uniform) -->
                        <rect x="10" y="12" width="12" height="12" fill="#388E3C"/>
                        <!-- Arm -->
                        <rect x="6" y="12" width="4" height="3" fill="#1B5E20"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#4CAF50"/>
                        <rect x="19" y="24" width="3" height="8" fill="#4CAF50"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="10" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="13" y="6" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Uniform) -->
                        <rect x="10" y="12" width="12" height="12" fill="#388E3C"/>
                        <!-- Arm -->
                        <rect x="22" y="12" width="4" height="3" fill="#1B5E20"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#4CAF50"/>
                        <rect x="19" y="24" width="3" height="8" fill="#4CAF50"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Head -->
                        <rect x="10" y="0" width="12" height="12" fill="#D2B48C"/>
                        <!-- Eyes -->
                        <rect x="10" y="3" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="3" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="13" y="9" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Uniform) -->
                        <rect x="10" y="12" width="12" height="12" fill="#388E3C"/>
                        <!-- Arm -->
                        <rect x="22" y="12" width="4" height="3" fill="#1B5E20"/>
                        <!-- Legs -->
                        <rect x="10" y="24" width="3" height="8" fill="#4CAF50"/>
                        <rect x="19" y="24" width="3" height="8" fill="#4CAF50"/>
                    </svg>`,
    },
  },
  Grace: {
    description:
      "A vibrant character with a colorful, triangular dress and unique hairstyle.",
    svgs: {
      right_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hair -->
                        <rect x="6" y="0" width="20" height="3" fill="#FFC107"/>
                        <rect x="10" y="3" width="12" height="3" fill="#FFC107"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="12" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="15" y="12" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Triangular Dress - Narrower) -->
                        <rect x="12" y="15" width="8" height="3" fill="#E91E63"/>
                        <rect x="12" y="18" width="8" height="3" fill="#E91E63"/>
                        <rect x="10" y="21" width="12" height="3" fill="#E91E63"/>
                        <rect x="10" y="24" width="12" height="3" fill="#E91E63"/>
                        <rect x="6" y="27" width="20" height="5" fill="#E91E63"/>
                        <!-- Dress Highlights -->
                        <rect x="12" y="18" width="8" height="3" fill="#F06292"/>
                        <rect x="10" y="21" width="12" height="3" fill="#F06292"/>
                        <rect x="6" y="24" width="20" height="3" fill="#F06292"/>
                        <rect x="3" y="27" width="26" height="5" fill="#F06292"/>
                    </svg>`,
      right_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hair -->
                        <rect x="6" y="0" width="20" height="3" fill="#FFC107"/>
                        <rect x="10" y="3" width="12" height="3" fill="#FFC107"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="12" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="18" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="15" y="15" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Triangular Dress - Narrower) -->
                        <rect x="12" y="15" width="8" height="3" fill="#E91E63"/>
                        <rect x="12" y="18" width="8" height="3" fill="#E91E63"/>
                        <rect x="10" y="21" width="12" height="3" fill="#E91E63"/>
                        <rect x="10" y="24" width="12" height="3" fill="#E91E63"/>
                        <rect x="6" y="27" width="20" height="5" fill="#E91E63"/>
                        <!-- Dress Highlights -->
                        <rect x="12" y="18" width="8" height="3" fill="#F06292"/>
                        <rect x="10" y="21" width="12" height="3" fill="#F06292"/>
                        <rect x="6" y="24" width="20" height="3" fill="#F06292"/>
                        <rect x="3" y="27" width="26" height="5" fill="#F06292"/>
                    </svg>`,
      left_happy: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hair -->
                        <rect x="6" y="0" width="20" height="3" fill="#FFC107"/>
                        <rect x="10" y="3" width="12" height="3" fill="#FFC107"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="10" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Happy Mouth -->
                        <rect x="13" y="12" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Triangular Dress - Narrower) -->
                        <rect x="12" y="15" width="8" height="3" fill="#E91E63"/>
                        <rect x="12" y="18" width="8" height="3" fill="#E91E63"/>
                        <rect x="10" y="21" width="12" height="3" fill="#E91E63"/>
                        <rect x="10" y="24" width="12" height="3" fill="#E91E63"/>
                        <rect x="6" y="27" width="20" height="5" fill="#E91E63"/>
                        <!-- Dress Highlights -->
                        <rect x="12" y="18" width="8" height="3" fill="#F06292"/>
                        <rect x="10" y="21" width="12" height="3" fill="#F06292"/>
                        <rect x="6" y="24" width="20" height="3" fill="#F06292"/>
                        <rect x="3" y="27" width="26" height="5" fill="#F06292"/>
                    </svg>`,
      left_sad: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <!-- Hair -->
                        <rect x="6" y="0" width="20" height="3" fill="#FFC107"/>
                        <rect x="10" y="3" width="12" height="3" fill="#FFC107"/>
                        <!-- Head -->
                        <rect x="10" y="6" width="12" height="6" fill="#FFECB3"/>
                        <!-- Eyes -->
                        <rect x="10" y="9" width="3" height="3" fill="#000000"/>
                        <rect x="16" y="9" width="3" height="3" fill="#000000"/>
                        <!-- Sad Mouth -->
                        <rect x="13" y="15" width="3" height="3" fill="#FF0000"/>
                        <!-- Body (Triangular Dress - Narrower) -->
                        <rect x="12" y="15" width="8" height="3" fill="#E91E63"/>
                        <rect x="12" y="18" width="8" height="3" fill="#E91E63"/>
                        <rect x="10" y="21" width="12" height="3" fill="#E91E63"/>
                        <rect x="10" y="24" width="12" height="3" fill="#E91E63"/>
                        <rect x="6" y="27" width="20" height="5" fill="#E91E63"/>
                        <!-- Dress Highlights -->
                        <rect x="12" y="18" width="8" height="3" fill="#F06292"/>
                        <rect x="10" y="21" width="12" height="3" fill="#F06292"/>
                        <rect x="6" y="24" width="20" height="3" fill="#F06292"/>
                        <rect x="3" y="27" width="26" height="5" fill="#F06292"/>
                    </svg>`,
    },
  },
};

// Get random character for new players
function getRandomCharacter() {
  const characters = Object.keys(characterData);
  return characters[Math.floor(Math.random() * characters.length)];
}

// Get character sprite based on state
function getCharacterSprite(characterName, direction, emotion) {
  const character = characterData[characterName];
  if (!character) return null;

  const spriteKey = `${direction}_${emotion}`;
  return character.svgs[spriteKey] || character.svgs.right_happy;
}
