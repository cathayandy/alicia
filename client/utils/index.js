export function sleep(ms) {
    return new Promise((resolve, _reject) => {
        setTimeout(resolve, ms);
    });
}

export function fileDownload(content, filename) {
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
}

export const reviewMap = {
    'file-broken': '证明文件损坏/无法打开',
    'file-blur': '证明文件模糊/无法辨认',
    'unmatch': '免修类别与证明文件不符',
    // 'disqualified': '未达到要求',
    // 'invalid-phone': '手机无法接通',
};

export const errMap = {
    'Not Found': '没有此用户',
    'Not Match': '您的用户名和密码不匹配',
    'Captcha Invalid or Expired': '验证码无效或已过期',
    'Invalid Email Address': '邮箱格式错误',
    'Email Already Existed': '该邮箱已被注册',
    'Student Not Match': '学号和姓名不匹配',
    'Already Registered': '学号已被其他用户认证',
    'Student Not Found': '学号不存在',
};

export const certTypeMap = {
    toefl: '托福',
    ielts: '雅思',
    gmat: 'GMAT',
    gre: 'GRE',
    cet6: '大学英语六级',
};
