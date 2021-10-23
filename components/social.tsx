import { ReactNode } from 'react'

// type Props = {
//   children?: ReactNode
// }

type Props = {
  dribbble_username?: string
  facebook_username?: string
  telegram_username?: string
  flickr_username?: string
  github_username?: string
  instagram_username?: string
  linkedin_username?: string
  twitter_username?: string
  pinterest_username?: string
  youtube_username?: string
  
}

const Social = ({...names}: Props) => {
  return (
  
    <div className='orange list-none'>

      { (names.dribbble_username)
        ? <li>
            <a href="https://dribbble.com/"{ ...names.dribbble_username }>
              <svg className="w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#dribbble"></use></svg>
              <span className="username">{names.dribbble_username}</span>
            </a>
          </li>
        : <div></div>
      }
      
      { (names.facebook_username)
        ?
        <li>
          <a className='flex' href="https://www.facebook.com/"{ ...names.facebook_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#facebook"></use></svg>
            <span className="username">{ names.facebook_username }</span>
          </a>
        </li>
        :
        <div></div>
      }

      { (names.facebook_username)
        ?
        <li>
          <a className='flex' href="https://t.me/"{ ...names.telegram_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#telegram"></use></svg>
            <span className="username">{ names.telegram_username }</span>
          </a>
        </li>
        :
        <div></div>
      }

      { (names.flickr_username)
        ?
        <li>
          <a className='flex' href="https://www.flickr.com/photos/"{ ...names.flickr_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#flickr"></use></svg>
            <span className="username">{ names.flickr_username }</span>
          </a>
        </li>
        :
        <div></div>
      }

      { (names.github_username)
        ?
        <li>
          <a className='flex' href="https://github.com/"{ ...names.github_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#github"></use></svg>
            <span className="username">{ names.github_username }</span>
          </a>
        </li>
        :
        <div></div>
      }


      { (names.instagram_username)
        ?
        <li>
          <a className='flex' href="https://instagram.com/"{ ...names.instagram_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#instagram"></use></svg>
            <span className="username">{ names.instagram_username }</span>
          </a>
        </li>
        :
        <div></div>
      }

      { (names.linkedin_username)
        ?
        <li>
          <a className='flex' href="https://github.com/"{ ...names.linkedin_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#linkedin"></use></svg>
            <span className="username">{ names.linkedin_username }</span>
          </a>
        </li>
        :
        <div></div>
      }

      { (names.pinterest_username)
        ?
        <li>
          <a className='flex' href="https://www.pinterest.com/"{ ...names.pinterest_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#pinterest"></use></svg>
            <span className="username">{ names.pinterest_username }</span>
          </a>
        </li>
        :
        <div></div>
      }

      { (names.twitter_username)
        ?
        <li>
          <a className='flex' href="https://www.twitter.com/"{ ...names.twitter_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#twitter"></use></svg>
            <span className="username">{ names.twitter_username }</span>
          </a>
        </li>
        :
        <div></div>
      }

      { (names.youtube_username)
        ?
        <li>
          <a className='flex' href="https://youtube.com/"{ ...names.youtube_username }>
            <svg className="m-1 w-4 h-4 social_icon"><use xlinkHref="/assets/img/icons/social-icons.svg#youtube"></use></svg>
            <span className="username">{ names.youtube_username }</span>
          </a>
        </li>
        :
        <div></div>
      }
      
{/*       
      {%- if site.telegram_username -%}<li><a href="https://t.me/{{ site.telegram_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#telegram' | relative_url }}"></use></svg> <span class="username">{{ site.telegram_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.flickr_username -%}<li><a href="https://www.flickr.com/photos/{{ site.flickr_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#flickr' | relative_url }}"></use></svg> <span class="username">{{ site.flickr_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.github_username -%}<li><a href="https://github.com/{{ site.github_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#github' | relative_url }}"></use></svg> <span class="username">{{ site.github_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.instagram_username -%}<li><a href="https://instagram.com/{{ site.instagram_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#instagram' | relative_url }}"></use></svg> <span class="username">{{ site.instagram_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.linkedin_username -%}<li><a href="https://www.linkedin.com/in/{{ site.linkedin_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#linkedin' | relative_url }}"></use></svg> <span class="username">{{ site.linkedin_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.pinterest_username -%}<li><a href="https://www.pinterest.com/{{ site.pinterest_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#pinterest' | relative_url }}"></use></svg> <span class="username">{{ site.pinterest_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.twitter_username -%}<li><a href="https://www.twitter.com/{{ site.twitter_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#twitter' | relative_url }}"></use></svg> <span class="username">{{ site.twitter_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.youtube_username -%}<li><a href="https://youtube.com/{{ site.youtube_username| cgi_escape | escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#youtube' | relative_url }}"></use></svg> <span class="username">{{ site.youtube_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.googleplus_username -%}<li><a href="https://plus.google.com/{{ site.googleplus_username| escape }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#googleplus' | relative_url }}"></use></svg> <span class="username">{{ site.googleplus_username| escape }}</span></a></li>{%- endif -%}
      
      {%- if site.rss -%}<li><a href="{{ 'feed.xml' | relative_url }}"><svg class="svg-icon"><use xlink:href="{{ '/assets/social-icons.svg#rss' | relative_url }}"></use></svg> <span>{{ site.rss | escape }}</span></a></li>{%- endif -%} */}

    </div>
  )
}

export default Social
