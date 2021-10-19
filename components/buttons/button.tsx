import { isTypeElement } from 'typescript'
import styles from './Button.module.css'

type Props = {
  href: string
  text: string
}

  

export function Button({href, text}: Props) {
  return (
    <div>
    <a href={href}>
      <button className={styles.buttonStyle}>{text}</button>
      </a>
    </div>
  )
}

