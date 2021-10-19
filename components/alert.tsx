import Container from './container'

type Props = {
  preview?: boolean
}

const Alert = ({ preview }: Props) => {
  return (
    <div>
      <Container>
        <div className="py-2 text-center text-sm">
          {preview ? (
            <>
              This page is a preview.{' '}
              <a
                href="/api/exit-preview"
                className="underline"
              >
                Click here
              </a>{' '}
              to exit preview mode.
            </>
          ) : (
            <>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

export default Alert
