const axios = require('axios')
const AdmZip = require('adm-zip')
const fs = require('fs')
const path = require('path')
const dotenv =  require('dotenv');
dotenv.config('./env');
console.log(process.env.filename);





// 定义请求的 URL 和轮询间隔时间（毫秒）
// const url = 'https://example.com/api/endpoint';
const pollInterval = 5000

// 轮询函数
async function poll() {
  try {
    const imgparams = {
      input:`${process.env.prompt}`,
      model: 'nai-diffusion-3',
      action: 'generate',
      parameters: {
        width: 832,
        height: 1216,
        scale: 5,
        sampler: 'k_euler',
        steps: 28,
        n_samples: 1,
        ucPreset: 0,
        qualityToggle: true,
        sm: false,
        sm_dyn: false,
        dynamic_thresholding: false,
        controlnet_strength: 1,
        legacy: false,
        add_original_image: false,
        uncond_scale: 1,
        cfg_rescale: 0,
        noise_schedule: 'native',
        negative_prompt:`${process.env.negative_prompt}`,
      },
    }
    // 发送 POST 请求
    const response = await axios.post(
      'https://api.novelai.net/ai/generate-image',
      imgparams,
      {
        headers: {
          Authorization:
            `Bearer ${process.env.token}`,
        },
        responseType: 'arraybuffer'
      }
    )
// 定义保存文件的目标文件夹路径
const targetFolderPath = path.join(__dirname, `${process.env.filename}`);

// 创建目标文件夹
if (!fs.existsSync(targetFolderPath)) {
  fs.mkdirSync(targetFolderPath);
}
    // 检查响应状态码
    if (response.status === 200) {
      const zipData = response.data

      // 创建一个临时文件名
      const tempFileName = `${Math.random().toString(36).substring(7)}.zip`

      // 将压缩文件保存到临时文件
      fs.writeFileSync(tempFileName, zipData, 'binary')

      // 解压缩文件
      const zip = new AdmZip(tempFileName)
      const zipEntries = zip.getEntries()

      // 遍历解压缩后的文件并保存
      zipEntries.forEach((entry) => {
        const entryName = entry.entryName
        const randomFileName = `${Math.random()
          .toString(36)
          .substring(7)}${path.extname(entryName)}`
        const outputPath = path.join(targetFolderPath, randomFileName)

        // 保存解压缩后的文件
        fs.writeFileSync(outputPath, entry.getData(), 'binary')

        console.log(`保存文件: ${outputPath}`)
      })

      // 删除临时文件
      fs.unlinkSync(tempFileName)
    } else {
      console.log(`请求失败，状态码: ${response.status}`)
    }
  } catch (error) {
    console.error('请求出错:', error)
  }

  // 继续轮询
  setTimeout(poll, pollInterval)
}

// 启动轮询
poll()
