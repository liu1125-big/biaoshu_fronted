/**
 * 登录页面
 */

import { DocumentIcon, UserIcon, LockIcon, EyeIcon, EyeOffIcon, BoltIcon, DatabaseIcon, ShieldIcon, CheckIcon } from '../../../shared/ui/Icons';
import { Dialog } from '../../../shared/ui/Dialog';
import { useLoginForm } from '../hooks/useLoginForm';
import styles from '../css/login.module.css';

const menuItems = [
  { Icon: BoltIcon, text: '智能解析招标文件，一键生成标书' },
  { Icon: DatabaseIcon, text: '知识库管理，积累企业核心资料' },
  { Icon: ShieldIcon, text: '敏感信息匿名化，保护企业数据安全' },
];

export default function LoginPage() {
  const {
    username, setUsername,
    password, setPassword,
    remember, setRemember,
    showPassword, setShowPassword,
    handleLogin,
    forgotOpen, setForgotOpen,
    forgotPhone, setForgotPhone,
    forgotPwd, setForgotPwd,
    forgotConfirmPwd, setForgotConfirmPwd,
    handleForgotSubmit,
    closeForgot,
    registerOpen, setRegisterOpen,
    regAccount, setRegAccount,
    regPhone, setRegPhone,
    regPwd, setRegPwd,
    regConfirmPwd, setRegConfirmPwd,
    handleRegisterSubmit,
    closeRegister,
  } = useLoginForm();

  return (
    <div className={styles.page}>
      {/* 左侧区域 */}
      <div className={styles.left}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`${styles.circle} ${styles[`circle-${i}`]}`} />
        ))}
        <div className={styles['logo-area']}>
          <div className={styles['logo-icon']}>
            <DocumentIcon style={{ width: 28, height: 28 }} />
          </div>
          <div className={styles['logo-lines']}>
            <span className={styles['logo-line1']}>AI 标书</span>
            <span className={styles['logo-line2']}>投标智能体</span>
          </div>
        </div>
        <div className={styles['center-card']}>
          <div className={styles['glass-card']}>
            <div className={styles['glass-card-image']}>
              <img src="/dashboard-preview.png" alt="系统预览" />
            </div>
            <h3>智能生成专业投标文件</h3>
            <p>基于 AI 技术，快速解析招标文件</p>
            <p>自动生成高质量标书，提升中标率</p>
          </div>
        </div>
        <div className={styles['bottom-menu']}>
          {menuItems.map(({ Icon, text }, i) => (
            <div key={i} className={styles['menu-item']}>
              <div className={styles['menu-icon']}><Icon /></div>
              <span className={styles['menu-text']}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧区域 */}
      <div className={styles.right}>
        <div className={styles['login-container']}>
          <div className={styles['login-header']}>
            <h1 className={styles['login-title']}>欢迎回来</h1>
            <p className={styles['login-subtitle']}>登录到 AI标书 投标智能体平台</p>
          </div>
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles['input-group']}>
              <label className={styles['input-label']}>账号</label>
              <div className={styles['input-wrapper']}>
                <span className={styles['input-icon']}><UserIcon /></span>
                <input type="text" className={styles.input} placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>
            <div className={styles['input-group']}>
              <label className={styles['input-label']}>密码</label>
              <div className={styles['input-wrapper']}>
                <span className={styles['input-icon']}><LockIcon /></span>
                <input type={showPassword ? 'text' : 'password'} className={`${styles.input} ${styles['password-input']}`} placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className={styles['password-toggle']} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className={styles['remember-row']}>
              <label className={styles['checkbox-wrapper']}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className={styles['checkbox-custom']}><CheckIcon /></span>
                <span className={styles['remember-text']}>记住我</span>
              </label>
              <a href="#" className={styles['forgot-link']} onClick={(e) => { e.preventDefault(); setForgotOpen(true); }}>忘记密码？</a>
            </div>
            <button type="submit" className={styles['submit-btn']}>登录</button>
            <div className={styles['signup-hint']}>
              <span>还没有账号？</span>
              <a href="#" className={styles['signup-link']} onClick={(e) => { e.preventDefault(); setRegisterOpen(true); }}>立即注册</a>
            </div>
          </form>
          <p className={styles.footer}>© 2026 AI标书 投标智能体. All rights reserved.</p>
        </div>
      </div>

      {/* 找回密码弹窗 */}
      <Dialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        kicker="找回密码"
        title="找回密码"
        description="请输入以下信息重置密码。"
        fields={[
          { label: '手机号', value: forgotPhone, setValue: setForgotPhone, type: 'tel', placeholder: '请输入手机号' },
          { label: '重置密码', value: forgotPwd, setValue: setForgotPwd, type: 'password', placeholder: '请输入新密码' },
          { label: '确认重置密码', value: forgotConfirmPwd, setValue: setForgotConfirmPwd, type: 'password', placeholder: '请再次输入新密码' },
        ]}
        inputClassName={`${styles.input} ${styles.dialogInput}`}
        onConfirm={handleForgotSubmit}
        onCancel={closeForgot}
      />

      {/* 注册弹窗 */}
      <Dialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        kicker="创建账户"
        title="创建账户"
        description="填写以下信息以创建新账户。"
        maxWidth={600}
        fields={[
          { label: '账户', value: regAccount, setValue: setRegAccount, type: 'text', placeholder: '请输入账户名' },
          { label: '手机号', value: regPhone, setValue: setRegPhone, type: 'tel', placeholder: '请输入手机号' },
          { label: '密码', value: regPwd, setValue: setRegPwd, type: 'password', placeholder: '请输入密码' },
          { label: '确认密码', value: regConfirmPwd, setValue: setRegConfirmPwd, type: 'password', placeholder: '请再次输入密码' },
        ]}
        inputClassName={`${styles.input} ${styles.dialogInput}`}
        inputStyle={{ marginTop: 4 }}
        onConfirm={handleRegisterSubmit}
        onCancel={closeRegister}
      />
    </div>
  );
}
