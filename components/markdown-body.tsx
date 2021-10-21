import markdownStyles from './markdown-styles.module.css'

type Props = {
  content: string
  classParam?: string
}

const MarkdownBody = ({ content, classParam }: Props) => {
  return (
    <div className={classParam}>
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

export default MarkdownBody
