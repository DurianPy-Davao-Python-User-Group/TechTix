import iconFb from '@/assets/logos/icon-fb.svg';
import iconLinkedin from '@/assets/logos/icon-linkedin.svg';
import { FormError, FormItem, FormLabel } from '@/components/Form';
import Input from '@/components/Input';

const BasicInfoStep = () => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl text-pycon-dark-blue bg-pycon-white/50 border-[1.24px] border-pycon-white/60 rounded-[32px] sm:rounded-[53.19px] p-6 sm:p-10 shadow-sm md:bg-transparent md:border-0 md:rounded-none md:p-0 md:shadow-none">


      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">Name</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <FormItem name="firstName">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">First Name *</FormLabel>
                <Input pyconStyles type="text" placeholder="e.g. Maria" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="lastName">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">Last Name *</FormLabel>
                <Input pyconStyles type="text" placeholder="e.g. Santos" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="nickname">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">Nickname *</FormLabel>
                <Input pyconStyles type="text" placeholder="What should we call you?" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">Identity</h3>
        <div className="w-full">
          <FormItem name="pronouns">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">Pronouns *</FormLabel>
                <Input pyconStyles type="text" placeholder="e.g. she/her, they/them" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <FormItem name="contactNumber">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">Contact Number *</FormLabel>
                <Input pyconStyles type="text" placeholder="09XXXXXXXXX" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="organization">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  Affiliation / Organization *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="Where do you work or study?" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <div className="md:col-span-2 w-full">
            <FormItem name="jobTitle">
              {({ field }) => (
                <div className="flex flex-col gap-2 w-full">
                  <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">Role in Tech *</FormLabel>
                  <Input pyconStyles type="text" placeholder="e.g. Software Engineer, Designer, Student" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-inter font-extrabold uppercase tracking-[0.12em] text-pycon-dark-blue/30">Socials</h3>
        <div className="flex flex-col gap-5 w-full">
          <FormItem name="facebookLink">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  <img src={iconFb} alt="Facebook" className="w-5 h-5 object-contain" />
                  Facebook *
                </FormLabel>
                <Input pyconStyles type="text" placeholder="https://facebook.com/yourprofile" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="linkedInLink">
            {({ field }) => (
              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17.5px] text-pycon-orange tracking-[0.025em]">
                  <img src={iconLinkedin} alt="LinkedIn" className="w-5 h-5 object-contain" />
                  LinkedIn <span className="font-normal text-xs md:text-sm text-pycon-dark-blue/40 tracking-normal">(optional)</span>
                </FormLabel>
                <Input pyconStyles type="text" placeholder="https://linkedin.com/in/username" {...field} />
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
